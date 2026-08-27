using System.Text;
using backend.Data;
using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Services.EmailService;
using backend.Wrappers;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CustomerService;

public class CustomerService : ICustomerService
{
    private readonly DataContext _context;
    private readonly IEmailService _emailService;
    public CustomerService(DataContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> GetCustomerById(Guid id)
    {
        var customer = await _context.Customers.Where(c => c.Id == id)
                                            .Include(c => c.Properties)
                                            .Include(c => c.CustomerPhones)
                                            .Include(c => c.Notes
                                                .OrderByDescending(n => n.CreatedAt)
                                            )
                                            .FirstOrDefaultAsync();
        if (customer == null)
        {
            return new ApiResponse<object>
            {
                Success = false,
                Payload = null,
                ErrorMessage = "Customer not found."
            };
        }

        var invoices = await _context.Invoices
                                     .Where(i => i.CustomerId == id)
                                     .Include(i => i.LineItems)
                                     .OrderByDescending(i => i.CreatedAt)
                                     .ToListAsync();

        var totalInvoiceValue = invoices.Sum(i => i.Total);

        var jobsCount = await _context.Jobs.CountAsync(j => j.CustomerId == id);
        var leadsCount = await _context.Leads.CountAsync(r => r.CustomerId == id);
        var quotesCount = await _context.Quotes.CountAsync(q => q.CustomerId == id);
        var invoicesCount = invoices.Count;

        return new ApiResponse<object>()
        {
            Success = true,
            Payload = new
            {
                Item = customer,
                TotalInvoiceValue = totalInvoiceValue,
                Counts = new
                {
                    Jobs = jobsCount,
                    Leads = leadsCount,
                    Quotes = quotesCount,
                    Invoices = invoicesCount
                }
            },
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<PagedResult<Customer>>> GetCustomersByWorkspace(Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.Customers.Where(c => c.WorkspaceId == workspaceId && c.IsArchived != true)
                                    .Include(c => c.Properties)
                                    .Include(c => c.CustomerPhones)
                                    .Include(c => c.Notes);

        var totalCount = await query.CountAsync();

        var items = await query.OrderByDescending(c => c.CreatedAt)
                            .Skip((pageNumber - 1) * pageSize)
                            .Take(pageSize)
                            .ToListAsync();

        var result = new PagedResult<Customer>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return new ApiResponse<PagedResult<Customer>>()
        {
            Success = true,
            Payload = result,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<PagedResult<Customer>>> GetCustomersByFilter(
        Guid workspaceId,
        int pageNumber,
        int pageSize,
        CustomerFilterDto filterDto)
    {
        var queryable = _context.Customers
            .Where(c => c.WorkspaceId == workspaceId && !c.IsArchived)
            .Include(c => c.Properties)
            .Include(c => c.CustomerPhones)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            var q = filterDto.Q.Trim().ToLower();
            queryable = queryable.Where(c =>
                c.FirstName.ToLower().Contains(q) ||
                c.LastName.ToLower().Contains(q) ||
                (c.CompanyName != null && c.CompanyName.ToLower().Contains(q))
            );
        }

        if (!string.IsNullOrWhiteSpace(filterDto.CustomerType) && filterDto.CustomerType.ToLower() != "all")
        {
            var isCompany = filterDto.CustomerType.ToLower() == "company";

            if (isCompany)
            {
                queryable = queryable.Where(c => c.CompanyName != null && c.CompanyName.Trim() != "");
            }
            else
            {
                queryable = queryable.Where(c => c.CompanyName == null || c.CompanyName.Trim() == "");
            }
        }


        if (filterDto.CreatedDateMin.HasValue)
            queryable = queryable.Where(c => c.CreatedAt >= filterDto.CreatedDateMin.Value);

        if (filterDto.CreatedDateMax.HasValue)
            queryable = queryable.Where(c => c.CreatedAt <= filterDto.CreatedDateMax.Value);

        if (filterDto.PropertiesMin.HasValue)
            queryable = queryable.Where(c => c.Properties.Count >= filterDto.PropertiesMin.Value);

        if (filterDto.PropertiesMax.HasValue)
            queryable = queryable.Where(c => c.Properties.Count <= filterDto.PropertiesMax.Value);

        if (filterDto.HasPhone.HasValue)
        {
            if (filterDto.HasPhone.Value)
                queryable = queryable.Where(c => c.CustomerPhones.Any());
            else
                queryable = queryable.Where(c => !c.CustomerPhones.Any());
        }

        // if (filterDto.HasEmail.HasValue)
        // {
        //     if (filterDto.HasEmail.Value)
        //         queryable = queryable.Where(c => c.Emails != null && c.Emails.Any(e => !string.IsNullOrWhiteSpace(e)));
        //     else
        //         queryable = queryable.Where(c => c.Emails == null || c.Emails.All(string.IsNullOrWhiteSpace));
        // }

        queryable = filterDto.SortBy?.ToLower() switch
        {
            "name" => filterDto.Sort == "desc"
                ? queryable.OrderByDescending(c => c.FirstName).ThenByDescending(c => c.LastName)
                : queryable.OrderBy(c => c.FirstName).ThenBy(c => c.LastName),

            "company" => filterDto.Sort == "desc"
                ? queryable.OrderByDescending(c => c.CompanyName)
                : queryable.OrderBy(c => c.CompanyName),

            "created" => filterDto.Sort == "desc"
                ? queryable.OrderByDescending(c => c.CreatedAt)
                : queryable.OrderBy(c => c.CreatedAt),

            _ => queryable.OrderBy(c => c.FirstName)
        };

        var totalCount = await queryable.CountAsync();
        var pagedCustomers = await queryable
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        if (filterDto.HasEmail.HasValue)
        {
            pagedCustomers = filterDto.HasEmail.Value
                ? pagedCustomers.Where(c => c.Emails != null && c.Emails.Any(e => !string.IsNullOrWhiteSpace(e))).ToList()
                : pagedCustomers.Where(c => c.Emails == null || c.Emails.All(string.IsNullOrWhiteSpace)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Tags))
        {
            var tagList = filterDto.Tags.Split(',').Select(t => t.Trim().ToLower()).ToList();

            pagedCustomers = pagedCustomers
                .Where(c => c.Tags != null && c.Tags.Any(tag => tagList.Contains(tag.ToLower())))
                .ToList();
        }

        return new ApiResponse<PagedResult<Customer>>
        {
            Success = true,
            Payload = new PagedResult<Customer>
            {
                Items = pagedCustomers,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task<CustomerStatsDto> GetCustomerStats(Guid workspaceId)
    {
        var now = DateTime.UtcNow;

        // ✅ Filter all counts by workspaceId
        var total = await _context.Customers
            .Where(c => c.WorkspaceId == workspaceId && !c.IsArchived)
            .CountAsync();

        var companies = await _context.Customers
            .Where(c => c.WorkspaceId == workspaceId && !string.IsNullOrWhiteSpace(c.CompanyName) && !c.IsArchived)
            .CountAsync();

        var newThisMonth = await _context.Customers
            .Where(c => c.WorkspaceId == workspaceId &&
                        !c.IsArchived &&
                        c.CreatedAt.Month == now.Month &&
                        c.CreatedAt.Year == now.Year)
            .CountAsync();

        var customersSlim = await _context.Customers.Where(c => c.WorkspaceId == workspaceId && !c.IsArchived)
                                                    .Include(c => c.CustomerPhones)
                                                    .Select(c => new
                                                    {
                                                        c.Emails,
                                                        PhoneCount = c.CustomerPhones.Count
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync();

        var missingInfo = customersSlim.Count(c =>
            c.Emails == null ||
            c.Emails.Count == 0 ||
            c.PhoneCount == 0);

        return new CustomerStatsDto
        {
            Total = total,
            Companies = companies,
            Individuals = total - companies,
            NewCustomers = newThisMonth,
            MissingInfoCustomers = missingInfo
        };
    }

    public async Task<ApiResponse<Customer>> CreateCustomer(CreateCustomerDto createCustomerDto)
    {
        var customer = createCustomerDto.Adapt<Customer>();
        customer.Id = Guid.NewGuid();

        if (createCustomerDto.Properties != null && createCustomerDto.Properties.Count != 0)
        {
            foreach (var property in createCustomerDto.Properties)
            {
                property.CustomerId = customer.Id;
            }
        }

        if (createCustomerDto.CustomFieldValues != null && createCustomerDto.CustomFieldValues.Count != 0)
        {
            foreach (var customFieldValue in createCustomerDto.CustomFieldValues)
            {
                customFieldValue.CustomerId = customer.Id;
            }
        }

        if (createCustomerDto.CustomerPhones != null && createCustomerDto.CustomerPhones.Count != 0)
        {
            foreach (var customerPhone in createCustomerDto.CustomerPhones)
            {
                customerPhone.CustomerId = customer.Id;
            }
        }

        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        return new ApiResponse<Customer>
        {
            Success = true,
            Payload = customer,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Customer>> UpdateCustomer(UpdateCustomerDto updatedCustomerDto)
    {
        var existingCustomer = await _context.Customers
                                             .Where(c => c.Id == updatedCustomerDto.Id)
                                             .Include(c => c.CustomFieldValues)
                                             .Include(c => c.Properties)
                                             .Include(c => c.CustomerPhones)
                                             .FirstOrDefaultAsync();

        if (existingCustomer == null)
        {
            return new ApiResponse<Customer>
            {
                Success = false,
                Payload = null,
                ErrorMessage = "Customer not found."
            };
        }

        updatedCustomerDto.Adapt(existingCustomer);

        existingCustomer.Emails = updatedCustomerDto.Emails;

        if (updatedCustomerDto.CustomFieldValues != null && existingCustomer.CustomFieldValues != null)
        {
            _context.CustomFieldValues.RemoveRange(existingCustomer.CustomFieldValues);
            foreach (var dtoValue in updatedCustomerDto.CustomFieldValues)
            {
                existingCustomer.CustomFieldValues.Add(dtoValue.Adapt<CustomFieldValue>());
            }
        }

        if (updatedCustomerDto.Properties != null && existingCustomer.Properties != null)
        {
            _context.Properties.RemoveRange(existingCustomer.Properties);
            foreach (var dtoValue in updatedCustomerDto.Properties)
            {
                existingCustomer.Properties.Add(dtoValue.Adapt<Property>());
            }
        }

        if (updatedCustomerDto.CustomerPhones != null && existingCustomer.CustomerPhones != null)
        {
            _context.CustomerPhones.RemoveRange(existingCustomer.CustomerPhones);
            foreach (var dtoValue in updatedCustomerDto.CustomerPhones)
            {
                existingCustomer.CustomerPhones.Add(dtoValue.Adapt<CustomerPhone>());
            }
        }

        existingCustomer.UpdatedAt = DateTime.UtcNow;
        existingCustomer.LastActivity = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse<Customer>
        {
            Success = true,
            Payload = existingCustomer,
            ErrorMessage = null
        };
    }

    public async Task DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);

        _context.Remove(customer);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<List<Customer>>> ImportCustomers(List<ImportedCustomerDto> customers, Guid workspaceId)
    {
        var existingCustomers = await _context.Customers.Where(c => c.WorkspaceId == workspaceId).ToListAsync();

        var normalizedExisting = existingCustomers.Select(c => new
        {
            Key = $"{c.FirstName.Trim().ToLower()}|{c.LastName.Trim().ToLower()}|{(c.Emails?.FirstOrDefault() ?? "").Trim().ToLower()}",
            c.Id
        }).ToHashSet();

        var toImport = new List<Customer>();

        foreach (var dto in customers)
        {
            var email = dto.Emails?.FirstOrDefault()?.Trim().ToLower() ?? "";
            var key = $"{dto.FirstName.Trim().ToLower()}|{dto.LastName.Trim().ToLower()}|{email}";

            if (normalizedExisting.Any(c => c.Key == key)) continue;

            var customer = dto.Adapt<Customer>();

            toImport.Add(customer);
        }

        await _context.Customers.AddRangeAsync(toImport);
        await _context.SaveChangesAsync();

        return new ApiResponse<List<Customer>>
        {
            Success = true,
            Payload = toImport,
            ErrorMessage = null
        };
    }

    public async Task<IActionResult> ExportCustomers(Guid workspaceId)
    {
        var customers = await _context.Customers
            .Where(c => c.WorkspaceId == workspaceId)
            .Include(c => c.CustomerPhones)
            .ToListAsync();

        if (customers == null || customers.Count == 0)
        {
            return new NotFoundResult();
        }

        var sb = new StringBuilder();

        sb.AppendLine("FirstName,LastName,CompanyName,DisplayName,IsCompany,Emails,JobNotifications,QuoteNotifications,InvoiceNotifications,BillingStreet,BillingCity,BillingState,BillingCountry,BillingPostalCode,IsArchived,Tags");

        foreach (var customer in customers)
        {
            var emails = Escape(string.Join(";", customer.Emails));
            var tags = Escape(string.Join(";", customer.Tags));

            sb.AppendLine(
                $"{Escape(customer.FirstName)}," +
                $"{Escape(customer.LastName)}," +
                $"{Escape(customer.CompanyName)}," +
                $"{Escape(customer.DisplayName)}," +
                $"{customer.IsCompany}," +
                $"{emails}," +
                $"{customer.IsReceiveJobNotifications}," +
                $"{customer.IsReceiveQuoteNotifications}," +
                $"{customer.IsReceiveInvoiceNotifications}," +
                $"{Escape(customer.BillingStreet)}," +
                $"{Escape(customer.BillingCity)}," +
                $"{Escape(customer.BillingState)}," +
                $"{Escape(customer.BillingCountry)}," +
                $"{Escape(customer.BillingPostalCode)}," +
                $"{customer.IsArchived}," +
                $"{tags}"
            );
        }

        var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fileName = $"customers_workspace_{workspaceId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return new FileContentResult(csvBytes, "text/csv")
        {
            FileDownloadName = fileName
        };
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

        customer.LastActivity = DateTime.UtcNow;

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
            customer.LastActivity = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task ArchiveCustomer(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            throw new Exception("Customer not found");

        customer.IsArchived = true;
        customer.LastActivity = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<object>> SendCustomerMail(string to, string subject, string message)
    {
        if (!IsValidEmail(to))
        {
            return new ApiResponse<object>
            {
                Success = false,
                Payload = "Invalid email address."
            };
        }

        var customer = await _context.Customers
                                     .Where(c => c.Emails.Any(e => e.Equals(to, StringComparison.CurrentCultureIgnoreCase)))
                                     .FirstOrDefaultAsync();

        var emailResult = await _emailService.SendEmailAsync(to, subject, message, message);

        if (emailResult.Success)
        {
            return new ApiResponse<object>
            {
                Success = true,
                Payload = "Email sent successfully."
            };
        }

        customer.LastActivity = DateTime.UtcNow;

        return new ApiResponse<object>
        {
            Success = false,
            Payload = $"Failed to send email: {emailResult.Error}"
        };
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private static string Escape(string? value)
    {
        if (value == null) return "";

        bool mustQuote = value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r');
        string escapedValue = value.Replace("\"", "\"\""); // Escape internal double quotes

        if (mustQuote)
        {
            return $"\"{escapedValue}\"";
        }
        return escapedValue;
    }
}
