using backend.Data;
using backend.Dtos.CustomFiledValueDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CustomFieldValueService;

public class CustomFieldServiceValue : ICustomFieldServiceValue
{
    private readonly DataContext _context;
    public CustomFieldServiceValue(DataContext context)
    {
        _context = context;
    }
    public async Task AddCustomFieldValue(AddCustomFiledValueDto newCustomFieldValue, Guid customFieldId)
    {
        var customFieldValue = newCustomFieldValue.Adapt<CustomFiledValue>();
        var customField = await _context.CustomFields.Where(c => c.CustomFieldId == customFieldId).Include(c => c.CustomFiledValue).FirstOrDefaultAsync();
        customFieldValue.CustomFieldValueId = Guid.NewGuid();
        customFieldValue.CustomFieldId = customFieldId;
        await _context.CustomFiledValues.AddAsync(customFieldValue);
        customField?.CustomFiledValue?.Add(customFieldValue);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCustomFieldValue(Guid id)
    {
        var customFieldValue = await _context.CustomFiledValues.FirstOrDefaultAsync(c => c.CustomFieldValueId == id);
        _context.Remove(customFieldValue);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<List<CustomFiledValue>>> GetCustomFieldValues()
    {
        var customFieldValues = await _context.CustomFiledValues.ToListAsync();
        return new ApiResponse<List<CustomFiledValue>>()
        {
            Success = true,
            Payload = customFieldValues,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<CustomFiledValue>> GetCustomFieldValuesById(Guid id)
    {
        var customFieldValue = await _context.CustomFiledValues.FirstOrDefaultAsync(c => c.CustomFieldValueId == id);
        return new ApiResponse<CustomFiledValue>()
        {
            Success = true,
            Payload = customFieldValue,
            ErrorMessage = null
        };
    }

    public async Task UpdateCustomFieldValue(UpdateCustomFiledValueDto updatedCustomFieldValue)
    {
        var customFieldValue = updatedCustomFieldValue.Adapt<CustomFiledValue>();
        _context.Update(customFieldValue);
        await _context.SaveChangesAsync();
    }
}