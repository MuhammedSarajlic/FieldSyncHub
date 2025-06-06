using backend.Data;
using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CustomerService;

public class CustomerService : ICustomerService
{
    private readonly DataContext _context;
    public CustomerService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Customers>>> GetCustomers()
    {
        var customers = await _context.Customers.Where(c => c.Archived != true)
                                                .Include(c => c.CustomFields)
                                                .Include(c => c.Properties)
                                                .Include(c => c.CustomerPhones)
                                                .Include(c => c.Notes)
                                                .ToListAsync();
        return new ApiResponse<List<Customers>>()
        {
            Success = true,
            Payload = customers,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Customers>> GetCustomersById(Guid id)
    {
        var customer = await _context.Customers.Include(c => c.CustomFields)
                                               .Include(c => c.Properties)
                                               .Include(c => c.CustomerPhones)
                                               .Include(c => c.Notes
                                                    .OrderByDescending(n => n.CreatedAt)
                                                )
                                               .FirstOrDefaultAsync(c => c.Id == id);
        return new ApiResponse<Customers>()
        {
            Success = true,
            Payload = customer,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<PagedResult<Customers>>> GetCustomersByWorkspace(Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.Customers.Where(c => c.WorkspaceId == workspaceId && c.Archived != true)
                                    .Include(c => c.CustomFields)
                                    .Include(c => c.Properties)
                                    .Include(c => c.CustomerPhones)
                                    .Include(c => c.Notes);

        var totalCount = await query.CountAsync();

        var items = await query.Skip((pageNumber - 1) * pageSize)
                            .Take(pageSize)
                            .ToListAsync();

        var result = new PagedResult<Customers>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return new ApiResponse<PagedResult<Customers>>()
        {
            Success = true,
            Payload = result,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<PagedResult<Customers>>> GetCustomersByFilter(
        int pageNumber, int pageSize,
        Guid workspaceId,
        string? q, string? sortBy, string? sort,
        string? customerType,
        string? createdDateMin,
        string? createdDateMax,
        string? propertiesMin,
        string? propertiesMax,
        string? hasEmail,
        string? hasPhone,
        string? tags
    )
    {
        var queryable = _context.Customers.Where(c => c.WorkspaceId == workspaceId && c.Archived != true)
                                        .Include(c => c.Properties)
                                        .Include(c => c.CustomerPhones)
                                        .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(q))
        {
            queryable = queryable.Where(c =>
                c.FirstName.Contains(q) || c.LastName.Contains(q) || c.CompanyName.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(customerType) && customerType.ToLower() != "all")
        {
            queryable = customerType.ToLower() == "company"
                ? queryable.Where(c => c.IsCompany)
                : queryable.Where(c => !c.IsCompany);
        }

        if (DateTime.TryParse(createdDateMin, out var minDate))
        {
            queryable = queryable.Where(c => c.CreatedAt >= minDate);
        }

        if (DateTime.TryParse(createdDateMax, out var maxDate))
        {
            queryable = queryable.Where(c => c.CreatedAt <= maxDate);
        }

        if (int.TryParse(propertiesMin, out var minProperties))
        {
            queryable = queryable.Where(c => c.Properties.Count >= minProperties);
        }

        if (int.TryParse(propertiesMax, out var maxProperties))
        {
            queryable = queryable.Where(c => c.Properties.Count <= maxProperties);
        }

        if (!string.IsNullOrWhiteSpace(hasPhone) && hasPhone.ToLower() != "any")
        {
            queryable = hasPhone.ToLower() == "yes"
                ? queryable.Where(c => c.CustomerPhones != null && c.CustomerPhones.Count > 0)
                : queryable.Where(c => c.CustomerPhones == null || c.CustomerPhones.Count == 0);
        }

        // Sorting
        queryable = sortBy?.ToLower() switch
        {
            "name" => sort == "desc"
                ? queryable.OrderByDescending(c => c.FirstName).ThenByDescending(c => c.LastName)
                : queryable.OrderBy(c => c.FirstName).ThenBy(c => c.LastName),
            "company" => sort == "desc"
                ? queryable.OrderByDescending(c => c.CompanyName)
                : queryable.OrderBy(c => c.CompanyName),
            "created" => sort == "desc"
                ? queryable.OrderByDescending(c => c.CreatedAt)
                : queryable.OrderBy(c => c.CreatedAt),
            _ => queryable.OrderBy(c => c.FirstName)
        };

        // Now get paginated records
        var pagedCustomers = await queryable
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // 🔍 Apply client-side filters on paged data
        if (!string.IsNullOrWhiteSpace(hasEmail) && hasEmail.ToLower() != "any")
        {
            pagedCustomers = hasEmail.ToLower() == "yes"
                ? pagedCustomers.Where(c => c.Email != null && c.Email.Any(e => !string.IsNullOrWhiteSpace(e))).ToList()
                : pagedCustomers.Where(c => c.Email == null || c.Email.All(string.IsNullOrWhiteSpace)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(tags))
        {
            var tagList = tags.Split(',').Select(t => t.Trim().ToLower()).ToList();

            pagedCustomers = pagedCustomers
                .Where(c => c.Tags != null && c.Tags.Any(tag => tagList.Contains(tag.ToLower())))
                .ToList();
        }

        var totalCount = await queryable.CountAsync();

        return new ApiResponse<PagedResult<Customers>>
        {
            Success = true,
            Payload = new PagedResult<Customers>
            {
                Items = pagedCustomers,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            },
            ErrorMessage = null
        };

    }

    public async Task<ApiResponse<object>> ImportCustomers(List<ImportedCustomerDto> customers, Guid workspaceId)
    {
        var existingCustomers = await _context.Customers
            .Where(c => c.WorkspaceId == workspaceId)
            .ToListAsync();

        var normalizedExisting = existingCustomers.Select(c => new
        {
            Key = $"{c.FirstName.Trim().ToLower()}|{c.LastName.Trim().ToLower()}|{(c.Email?.FirstOrDefault() ?? "").Trim().ToLower()}",
            c.Id
        }).ToHashSet();

        var toImport = new List<Customers>();

        foreach (var dto in customers)
        {
            var email = dto.Email?.FirstOrDefault()?.Trim().ToLower() ?? "";
            var key = $"{dto.FirstName.Trim().ToLower()}|{dto.LastName.Trim().ToLower()}|{email}";

            if (normalizedExisting.Any(c => c.Key == key)) continue;

            var customer = new Customers
            {
                WorkspaceId = workspaceId,
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                CompanyName = dto.CompanyName,
                IsCompany = dto.IsCompany,
                Email = dto.Email,
                Tags = dto.Tags,
                VisitReminders = dto.VisitReminders,
                JobFollowUps = dto.JobFollowUps,
                QuoteFollowUps = dto.QuoteFollowUps,
                InvoiceFollowUps = dto.InvoiceFollowUps,
                Archived = dto.Archived,
                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            toImport.Add(customer);
        }

        await _context.Customers.AddRangeAsync(toImport);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>
        {
            Success = true,
            Payload = new
            {
                Imported = toImport.Count,
                Skipped = customers.Count - toImport.Count
            }
        };
    }

    public async Task<ApiResponse<List<ImportedCustomerDto>>> ExportCustomers(Guid workspaceId)
    {
        var customers = await _context.Customers
            .Where(c => c.WorkspaceId == workspaceId)
            .ToListAsync();

        var exported = customers.Select(c => new ImportedCustomerDto
        {
            FirstName = c.FirstName ?? string.Empty,
            LastName = c.LastName ?? string.Empty,
            CompanyName = c.CompanyName,
            IsCompany = c.IsCompany,
            Email = c.Email,
            Tags = c.Tags,
            VisitReminders = c.VisitReminders,
            JobFollowUps = c.JobFollowUps,
            QuoteFollowUps = c.QuoteFollowUps,
            InvoiceFollowUps = c.InvoiceFollowUps,
            Archived = c.Archived,
            CreatedAt = c.CreatedAt
        }).ToList();

        return new ApiResponse<List<ImportedCustomerDto>>
        {
            Success = true,
            Payload = exported
        };
    }


    public async Task AddCustomer(Customers newCustomer)
    {
        if (newCustomer.Id == Guid.Empty)
        {
            newCustomer.Id = Guid.NewGuid();
        }

        newCustomer.CustomerPhones ??= new List<CustomerPhone>();
        newCustomer.CustomFields ??= new List<CustomFields>();

        foreach (var phone in newCustomer.CustomerPhones)
        {
            phone.CustomerId = newCustomer.Id;
        }

        foreach (var field in newCustomer.CustomFields)
        {
            field.CustomerId = newCustomer.Id;
        }

        if (newCustomer.Properties != null && newCustomer.Properties.Any())
        {
            foreach (var property in newCustomer.Properties)
            {
                property.CustomerId = newCustomer.Id;
                await _context.Properties.AddAsync(property);
            }
        }


        await _context.Customers.AddAsync(newCustomer);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateCustomer(Customers updatedCustomer)
    {
        _context.Update(updatedCustomer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.Include(c => c.Properties)
                                               .Include(c => c.CustomerPhones)
                                               .Include(c => c.CustomFields)
                                               .FirstOrDefaultAsync(c => c.Id == id);

        if (customer != null)
        {
            _context.Remove(customer);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateCustomerTags(Guid id, string tag)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            throw new Exception("Customer not found");

        if (customer.Tags == null)
            customer.Tags = new List<string>();

        if (!customer.Tags.Contains(tag))
            customer.Tags.Add(tag);

        await _context.SaveChangesAsync();
    }

    public async Task RemoveCustomerTag(Guid id, string tag)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            throw new Exception("Customer not found");

        if (customer.Tags != null && customer.Tags.Contains(tag))
        {
            customer.Tags.Remove(tag);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ArchiveCustomer(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            throw new Exception("Customer not found");

        customer.Archived = true;

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetTotalCustomerCount()
    {
        return await _context.Customers.CountAsync();
    }

    public async Task<object> GetCompanyAndIndividualCount()
    {
        var customers = await _context.Customers.ToListAsync();

        var companies = customers.Count(c => c.IsCompany);
        var individuals = customers.Count(c => !c.IsCompany);

        return new
        {
            Companies = companies,
            Individuals = individuals,
            Total = companies + individuals
        };
    }

    public async Task<int> GetNewCustomersCount()
    {
        var now = DateTime.UtcNow;
        return await _context.Customers
            .Where(c => c.CreatedAt.Month == now.Month && c.CreatedAt.Year == now.Year)
            .CountAsync();
    }

    public async Task<int> GetCustomerMissingInfoCount()
    {
        var customers = await _context.Customers
            .Include(c => c.CustomerPhones)
            .ToListAsync();

        return customers.Count(c =>
            (c.Email == null) ||
            (c.CustomerPhones == null)
        );
    }

}
