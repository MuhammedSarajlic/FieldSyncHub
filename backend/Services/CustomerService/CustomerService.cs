using backend.Data;
using backend.Models;
using backend.Response;
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
                                               .Include(c => c.Notes)
                                               .FirstOrDefaultAsync(c => c.Id == id);
        return new ApiResponse<Customers>()
        {
            Success = true,
            Payload = customer,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Customers>>> GetCustomersByWorkspace(Guid workspaceId)
    {
        var customer = await _context.Customers.Include(c => c.CustomFields)
                                               .Include(c => c.Properties)
                                               .Include(c => c.CustomerPhones)
                                               .Include(c => c.Notes)
                                               .Where(c => c.WorkspaceId == workspaceId)
                                               .ToListAsync();
        return new ApiResponse<List<Customers>>()
        {
            Success = true,
            Payload = customer,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Customers>>> GetCustomersByFilter(
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
        var queryable = _context.Customers
            .Where(c => c.WorkspaceId == workspaceId)
            .Include(c => c.Properties)
            .Include(c => c.CustomerPhones)
            .AsQueryable();

        // 🔍 Server-side filters
        if (!string.IsNullOrWhiteSpace(q))
        {
            queryable = queryable.Where(c =>
                c.FirstName.Contains(q) || c.LastName.Contains(q) || c.CompanyName.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(customerType) && customerType.ToLower() != "all")
        {
            queryable = customerType == "company"
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
            if (hasPhone == "yes")
                queryable = queryable.Where(c => c.CustomerPhones != null && c.CustomerPhones.Count > 0);
            else if (hasPhone == "no")
                queryable = queryable.Where(c => c.CustomerPhones == null || c.CustomerPhones.Count == 0);
        }

        if (!string.IsNullOrWhiteSpace(tags))
        {
            var tagList = tags.Split(',').Select(t => t.Trim()).ToList();
            queryable = queryable.Where(c => c.Tags != null && c.Tags.Any(tag => tagList.Contains(tag)));
        }

        // 🔄 Sorting (before executing query)
        queryable = sortBy?.ToLower() switch
        {
            "name" => sort == "desc"
                ? queryable.OrderByDescending(c => c.FirstName).ThenByDescending(c => c.LastName)
                : queryable.OrderBy(c => c.FirstName).ThenBy(c => c.LastName),
            "company" => sort == "desc"
                ? queryable.OrderByDescending(c => c.CompanyName)
                : queryable.OrderBy(c => c.CompanyName),
            _ => queryable.OrderBy(c => c.CompanyName)
        };

        // 💾 Execute query first (materialize results)
        var customers = await queryable.ToListAsync();

        // 🔍 Client-side filter: Email (primitive list)
        if (!string.IsNullOrWhiteSpace(hasEmail) && hasEmail == "yes")
        {
            customers = customers
                .Where(c => c.Email != null && c.Email.Any(e => !string.IsNullOrWhiteSpace(e)))
                .ToList();
        }

        return new ApiResponse<List<Customers>>
        {
            Success = true,
            Payload = customers,
            ErrorMessage = null
        };
    }



    public async Task AddCustomer(Customers newCustomer)
    {
        // Ensure CustomerId is correctly assigned
        if (newCustomer.Id == Guid.Empty)
        {
            newCustomer.Id = Guid.NewGuid();
        }

        // Ensure collections are initialized if they are null
        newCustomer.CustomerPhones ??= new List<CustomerPhone>();
        newCustomer.CustomFields ??= new List<CustomFields>();

        // Assign correct CustomerId to related entities
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
}
