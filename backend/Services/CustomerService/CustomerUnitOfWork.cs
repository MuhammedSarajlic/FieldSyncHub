using backend.Data;
using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Services.CustomFieldService;
using backend.Services.CustomFieldValueService;
using backend.Services.Phones;
using backend.Services.PropertyService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CustomerService;

public class CustomerUnitOfWork : ICustomerUnitOfWork
{
    private readonly DataContext _context;
    private readonly IPropertyService _propertyService;
    private readonly ICustomFieldServiceValue _customFieldServiceValue;
    private readonly ICustomerPhoneService _customerPhoneService;
    private readonly ILogger<CustomerUnitOfWork> _logger;

    public CustomerUnitOfWork(
        DataContext context,
        IPropertyService propertyService,
        ICustomFieldServiceValue customFieldServiceValue,
        ICustomerPhoneService phoneService,
        ILogger<CustomerUnitOfWork> logger)
    {
        _context = context;
        _propertyService = propertyService;
        _customFieldServiceValue = customFieldServiceValue;
        _customerPhoneService = phoneService;
        _logger = logger;
    }

    public async Task<ApiResponse<Customer>> UpdateCustomerWithDependenciesAsync(UpdateCustomerDto updatedCustomerDto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Load customer with all related data
            var customer = await _context.Customers.Include(c => c.Properties)
                                                .Include(c => c.CustomFieldValues)
                                                .Include(c => c.CustomerPhones)
                                                .FirstOrDefaultAsync(c => c.Id == updatedCustomerDto.Id);

            if (customer == null)
            {
                return new ApiResponse<Customer>
                {
                    Success = false,
                    ErrorMessage = "Customer not found."
                };
            }

            // Update main customer entity
            updatedCustomerDto.Adapt(customer);
            customer.UpdatedAt = DateTime.UtcNow;

            // Update Properties (batch update)
            if (updatedCustomerDto.Properties != null)
            {
                await _propertyService.UpdateProperties(updatedCustomerDto.Properties, customer.Id);
            }

            // Update Custom Fields (batch update)
            if (updatedCustomerDto.CustomFieldValues != null)
            {
                await _customFieldServiceValue.UpdateCustomFieldValues(updatedCustomerDto.CustomFieldValues, customer.Id);
            }

            // Update Phones (batch update)
            if (updatedCustomerDto.CustomerPhones != null)
            {
                await _customerPhoneService.UpdateCustomerPhones(updatedCustomerDto.CustomerPhones, customer.Id);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new ApiResponse<Customer>
            {
                Success = true,
                Payload = customer
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to update customer {CustomerId}", updatedCustomerDto.Id);
            throw; // Or return a failure ApiResponse
        }
    }
}