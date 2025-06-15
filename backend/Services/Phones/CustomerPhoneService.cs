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

    public async Task<ApiResponse<CustomerPhone>> CreateCustomerPhone(CreateCustomerPhoneDto createCustomerPhoneDto)
    {
        var customerPhone = createCustomerPhoneDto.Adapt<CustomerPhone>();
        var customer = await _context.Customers.Where(c => c.Id == createCustomerPhoneDto.CustomerId)
                                            .Include(c => c.CustomerPhones)
                                            .FirstOrDefaultAsync();

        customerPhone.Id = Guid.NewGuid();

        await _context.CustomerPhones.AddAsync(customerPhone);
        customer?.CustomerPhones?.Add(customerPhone);
        await _context.SaveChangesAsync();

        return new ApiResponse<CustomerPhone>
        {
            Success = true,
            Payload = customerPhone,
            ErrorMessage = null
        };
    }

    public async Task CreateCustomerPhoneBulk(List<CreateCustomerPhoneDto> createCustomerPhoneDtos, Guid customerId)
    {
        var customer = await _context.Customers.Where(c => c.Id == customerId)
                                            .Include(c => c.CustomerPhones)
                                            .FirstOrDefaultAsync();

        var customerPhones = createCustomerPhoneDtos.Adapt<List<CustomerPhone>>();

        foreach (var phone in customerPhones)
        {
            customer?.CustomerPhones?.Add(phone);
        }

        await _context.CustomerPhones.AddRangeAsync(customerPhones);
        await _context.SaveChangesAsync();
    }

    public async Task<CustomerPhone> UpdateCustomerPhone(UpdateCustomerPhoneDto updatedCustomerPhoneDto)
    {
        var customerPhone = updatedCustomerPhoneDto.Adapt<CustomerPhone>();
        customerPhone.UpdatedAt = DateTime.UtcNow;

        _context.Update(customerPhone);
        await _context.SaveChangesAsync();

        return customerPhone;
    }

    public async Task UpdateCustomerPhones(ICollection<UpdateCustomerPhoneDto> updateCustomerPhonesDto, Guid customerId)
    {
        var existingPhones = await _context.CustomerPhones
            .Where(p => p.CustomerId == customerId)
            .ToListAsync();

        foreach (var phoneDto in updateCustomerPhonesDto)
        {
            var existingPhone = existingPhones.FirstOrDefault(p => p.Id == phoneDto.Id);

            if (existingPhone != null)
            {
                phoneDto.Adapt(existingPhone);
                existingPhone.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newPhone = phoneDto.Adapt<CustomerPhone>();
                newPhone.CustomerId = customerId;
                _context.CustomerPhones.Add(newPhone);
            }
        }

        // Handle deletions
        var removedPhones = existingPhones
            .Where(ep => !updateCustomerPhonesDto.Any(p => p.Id == ep.Id))
            .ToList();

        if (removedPhones.Count != 0)
        {
            _context.CustomerPhones.RemoveRange(removedPhones);
        }
    }

    public async Task DeleteCustomerPhone(Guid id)
    {
        var customerPhone = await _context.CustomerPhones.FirstOrDefaultAsync(p => p.Id == id);
        _context.Remove(customerPhone);
        await _context.SaveChangesAsync();
    }



}