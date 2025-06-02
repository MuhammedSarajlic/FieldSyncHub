using backend.Data;
using backend.Dtos.CustomFieldDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CustomFieldService;

public class CustomFieldService : ICustomFieldService
{
    private readonly DataContext _context;
    public CustomFieldService(DataContext context)
    {
        _context = context;
    }
    public async Task AddCustomField(AddCustomFieldDto newCustomField, Guid customerId)
    {
        var customField = newCustomField.Adapt<CustomFields>();
        var customer = await _context.Customers.Where(c => c.Id == customerId).Include(c => c.CustomFields).FirstOrDefaultAsync();
        customField.CustomFieldId = Guid.NewGuid();
        customField.CustomerId = customerId;
        await _context.CustomFields.AddAsync(customField);
        customer?.CustomFields?.Add(customField);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCustomField(Guid id)
    {
        var customField = await _context.CustomFields.FirstOrDefaultAsync(c => c.CustomFieldId == id);
        _context.Remove(customField);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<CustomFields>> GetCustomFieldsById(Guid id)
    {
        var customFields = await _context.CustomFields.Include(c => c.CustomFiledValue).FirstOrDefaultAsync(c => c.CustomFieldId == id);
        return new ApiResponse<CustomFields>()
        {
            Success = true,
            Payload = customFields,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<CustomFields>>> GetCustomFields()
    {
        var customFields = await _context.CustomFields.Include(c => c.CustomFiledValue).ToListAsync();
        return new ApiResponse<List<CustomFields>>()
        {
            Success = true,
            Payload = customFields,
            ErrorMessage = null
        };
    }

    public async Task UpdateCustomField(UpdateCustomFieldDto updatedCustomField)
    {
        var customField = updatedCustomField.Adapt<CustomFields>();
        _context.Update(customField);
        await _context.SaveChangesAsync();
    }
}