using backend.Data;
using backend.Models;
using backend.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CustomerService;

public class CustomerService : ICustomerService
{
    private readonly DataContext _context;
    public CustomerService(DataContext context)
    {
        _context = context;
    }

    public async Task AddCustomer(Customers newCustomer)
    {
        // Ensure CustomerId is correctly assigned
        if (newCustomer.CustomerId == Guid.Empty)
        {
            newCustomer.CustomerId = Guid.NewGuid();
        }

        // Ensure collections are initialized if they are null
        newCustomer.CustomerPhones ??= new List<CustomerPhone>();
        newCustomer.CustomFields ??= new List<CustomFields>();

        // Assign correct CustomerId to related entities
        foreach (var phone in newCustomer.CustomerPhones)
        {
            phone.CustomerId = newCustomer.CustomerId;
        }

        foreach (var field in newCustomer.CustomFields)
        {
            field.CustomerId = newCustomer.CustomerId;
        }

        if (newCustomer.Properties != null && newCustomer.Properties.Any()) 
        {
            foreach (var property in newCustomer.Properties)
            {
                property.CustomerId = newCustomer.CustomerId;
                await _context.Properties.AddAsync(property);
            }
        }


        await _context.Customers.AddAsync(newCustomer);
        await _context.SaveChangesAsync();
    }


    public async Task DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.Include(c => c.Properties)
                                               .Include(c => c.CustomerPhones)
                                               .Include(c => c.CustomFields)
                                               .FirstOrDefaultAsync(c => c.CustomerId == id);
        
        if (customer != null)
        {
            _context.Remove(customer);
            await _context.SaveChangesAsync();
        }
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
                                               .FirstOrDefaultAsync(c => c.CustomerId == id);
        return new ApiResponse<Customers>()
        {
            Success = true,
            Payload = customer,
            ErrorMessage = null
        };
    }

    public async Task UpdateCustomer(Customers updatedCustomer)
    {
        _context.Update(updatedCustomer);
        await _context.SaveChangesAsync();
    }
    

    public async Task UpdateCustomerTags(Guid customerId, string tag)
    {
        var customer = await _context.Customers.FindAsync(customerId);

        if (customer == null)
            throw new Exception("Customer not found");

        if (customer.Tags == null)
            customer.Tags = new List<string>();

        if (!customer.Tags.Contains(tag))
            customer.Tags.Add(tag);

        await _context.SaveChangesAsync();
    }

    public async Task RemoveCustomerTag(Guid customerId, string tag)
    {
        var customer = await _context.Customers.FindAsync(customerId);

        if (customer == null)
            throw new Exception("Customer not found");

        if (customer.Tags != null && customer.Tags.Contains(tag))
        {
            customer.Tags.Remove(tag);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ArchiveCustomer(Guid customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);

        if (customer == null)
            throw new Exception("Customer not found");

        customer.Archived = true;

        await _context.SaveChangesAsync();
    }
}
