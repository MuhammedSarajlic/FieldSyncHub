using backend.Data;
using backend.Dtos.CustomerPhoneDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Phones;

public class CustomerPhoneService : ICustomerPhoneService
{
    private readonly DataContext _context;
    public CustomerPhoneService(DataContext context)
    {
        _context = context;
    }

    public async Task AddBulkPhone(List<AddCustomerPhoneDto> customerPhones, Guid customerId)
    {
        var customer = await _context.Customers
        .Where(c => c.Id == customerId)
        .Include(c => c.CustomerPhones)
        .FirstOrDefaultAsync();

        var customerPhonesEntities = customerPhones.Select(p => new CustomerPhone
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            PhoneNumber = p.PhoneNumber,
            PhoneType = p.PhoneType,
            IsReceiveMessage = p.IsReceiveMessage
        }).ToList();

        foreach (var phone in customerPhonesEntities)
        {
            customer.CustomerPhones.Add(phone);
        }

        await _context.CustomerPhones.AddRangeAsync(customerPhonesEntities);
        await _context.SaveChangesAsync();
    }

    public async Task AddCustomerPhone(AddCustomerPhoneDto newCustomerPhone, Guid customerId)
    {
        var customerPhone = newCustomerPhone.Adapt<CustomerPhone>();
        var customer = await _context.Customers.Where(c => c.Id == customerId).Include(c => c.CustomerPhones).FirstOrDefaultAsync();
        newCustomerPhone.Id = Guid.NewGuid();
        customerPhone.CustomerId = customerId;
        await _context.CustomerPhones.AddAsync(customerPhone);
        customer?.CustomerPhones?.Add(customerPhone);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCustomerPhone(Guid id)
    {
        var customerPhone = await _context.CustomerPhones.FirstOrDefaultAsync(p => p.Id == id);
        _context.Remove(customerPhone);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<CustomerPhone>> GetCustomerPhoneById(Guid id)
    {
        var customerPhone = await _context.CustomerPhones.FirstOrDefaultAsync(p => p.Id == id);
        return new ApiResponse<CustomerPhone>()
        {
            Success = true,
            Payload = customerPhone,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<CustomerPhone>>> GetCustomerPhones()
    {
        var customerPhones = await _context.CustomerPhones.ToListAsync();
        return new ApiResponse<List<CustomerPhone>>()
        {
            Success = true,
            Payload = customerPhones,
            ErrorMessage = null
        };
    }

    public async Task UpdateCustomerPhone(CustomerPhone updatedCustomerPhone)
    {
        _context.Update(updatedCustomerPhone);
        await _context.SaveChangesAsync();
    }
}