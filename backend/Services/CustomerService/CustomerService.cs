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
        newCustomer.CustomerId = Guid.NewGuid();
        await _context.Customers.AddAsync(newCustomer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
        _context.Remove(customer);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<List<Customers>>> GetCustomers()
    {
        var customers = await _context.Customers.Include(c => c.CustomFields).ToListAsync();
        return new ApiResponse<List<Customers>>()
            {
                Success = true,
                Payload = customers,
                ErrorMessage = null
            };
    }

    public async Task<ApiResponse<Customers>> GetCustomersById(Guid id)
    {
        var customer = await _context.Customers.Include(c => c.CustomFields).FirstOrDefaultAsync(c => c.CustomerId==id);
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
}