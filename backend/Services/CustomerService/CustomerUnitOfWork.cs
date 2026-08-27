using backend.Data;
using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Services.CustomFieldValueService;
using backend.Services.CustomerPhoneService;
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

    public async Task<ApiResponse<Customer>> UpdateCustomerWithDependenciesAsync(UpdateCustomerDto updatedCustomerDto, Guid callerWorkspaceId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var customer = await _context.Customers.Where(c => c.Id == updatedCustomerDto.Id)
                                                 .Include(c => c.CustomFieldValues)
                                                 .Include(c => c.Properties)
                                                 .Include(c => c.CustomerPhones)
                                                 .FirstOrDefaultAsync();

            if (customer == null || customer.WorkspaceId != callerWorkspaceId)
            {
                return new ApiResponse<Customer>
                {
                    Success = false,
                    Payload = null,
                    ErrorMessage = "Customer not found."
                };
            }

            customer.CompanyName = updatedCustomerDto.CompanyName ?? customer.CompanyName;
            customer.BillingStreet = updatedCustomerDto.BillingStreet ?? customer.BillingStreet;
            customer.BillingCity = updatedCustomerDto.BillingCity ?? customer.BillingCity;
            customer.BillingState = updatedCustomerDto.BillingState ?? customer.BillingState;
            customer.BillingCountry = updatedCustomerDto.BillingCountry ?? customer.BillingCountry;
            customer.BillingPostalCode = updatedCustomerDto.BillingPostalCode ?? customer.BillingPostalCode;

            if (!string.IsNullOrEmpty(updatedCustomerDto.FirstName))
            {
                customer.FirstName = updatedCustomerDto.FirstName;
            }
            if (!string.IsNullOrEmpty(updatedCustomerDto.LastName))
            {
                customer.LastName = updatedCustomerDto.LastName;
            }
            if (!string.IsNullOrEmpty(updatedCustomerDto.DisplayName))
            {
                customer.DisplayName = updatedCustomerDto.DisplayName;
            }

            if (updatedCustomerDto.IsReceiveJobNotifications.HasValue)
            {
                customer.IsReceiveJobNotifications = updatedCustomerDto.IsReceiveJobNotifications.Value;
            }
            if (updatedCustomerDto.IsReceiveQuoteNotifications.HasValue)
            {
                customer.IsReceiveQuoteNotifications = updatedCustomerDto.IsReceiveQuoteNotifications.Value;
            }
            if (updatedCustomerDto.IsReceiveInvoiceNotifications.HasValue)
            {
                customer.IsReceiveInvoiceNotifications = updatedCustomerDto.IsReceiveInvoiceNotifications.Value;
            }
            if (updatedCustomerDto.Emails != null)
            {
                customer.Emails = updatedCustomerDto.Emails;
            }


            if (updatedCustomerDto.Properties != null)
            {
                await _propertyService.UpdateProperties(updatedCustomerDto.Properties, customer.Id);
            }

            if (updatedCustomerDto.CustomFieldValues != null)
            {
                await _customFieldServiceValue.UpdateCustomFieldValues(updatedCustomerDto.CustomFieldValues, customer.Id);
            }

            if (updatedCustomerDto.CustomerPhones != null)
            {
                await _customerPhoneService.UpdateCustomerPhones(updatedCustomerDto.CustomerPhones, customer.Id);
            }

            customer.UpdatedAt = DateTime.UtcNow;

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