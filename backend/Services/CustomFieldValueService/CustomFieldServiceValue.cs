using backend.Data;
using backend.Dtos.CustomFieldValueDto;
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

    public async Task<ApiResponse<List<CustomFieldValue>>> GetCustomFieldValues()
    {
        var customFieldValues = await _context.CustomFieldValues.ToListAsync();
        return new ApiResponse<List<CustomFieldValue>>()
        {
            Success = true,
            Payload = customFieldValues,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<CustomFieldValue>> GetCustomFieldValuesById(Guid id)
    {
        var customFieldValue = await _context.CustomFieldValues.FirstOrDefaultAsync(c => c.Id == id);
        return new ApiResponse<CustomFieldValue>()
        {
            Success = true,
            Payload = customFieldValue,
            ErrorMessage = null
        };
    }

    public async Task<CustomFieldValue> CreateCustomFieldValue(CreateCustomFieldValueDto createCustomFieldValueDto)
    {
        var customFieldValue = createCustomFieldValueDto.Adapt<CustomFieldValue>();
        var customField = await _context.CustomFields.Where(c => c.Id == createCustomFieldValueDto.CustomFieldId)
                                                    .FirstOrDefaultAsync();
        customFieldValue.Id = Guid.NewGuid();
        await _context.CustomFieldValues.AddAsync(customFieldValue);
        await _context.SaveChangesAsync();

        return customFieldValue;
    }

    public async Task<CustomFieldValue> UpdateCustomFieldValue(UpdateCustomFieldValueDto updatedCustomFieldValueDto)
    {
        var customFieldValue = updatedCustomFieldValueDto.Adapt<CustomFieldValue>();
        customFieldValue.UpdatedAt = DateTime.UtcNow;
        _context.Update(customFieldValue);
        await _context.SaveChangesAsync();

        return customFieldValue;
    }

    public async Task UpdateCustomFieldValues(ICollection<UpdateCustomFieldValueDto> updateCustomFieldValuesDto, Guid customerId)
    {
        var existingFieldValues = await _context.CustomFieldValues
            .Where(f => f.CustomerId == customerId)
            .ToListAsync();

        foreach (var fieldValueDto in updateCustomFieldValuesDto)
        {
            var existingFieldValue = existingFieldValues.FirstOrDefault(f => f.Id == fieldValueDto.Id);

            if (existingFieldValue != null)
            {
                fieldValueDto.Adapt(existingFieldValue);
                existingFieldValue.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newFieldValue = fieldValueDto.Adapt<CustomFieldValue>();
                newFieldValue.CustomerId = customerId;
                _context.CustomFieldValues.Add(newFieldValue);
            }
        }

        // Handle deletions
        var removedFieldValues = existingFieldValues
            .Where(ef => !updateCustomFieldValuesDto.Any(f => f.Id == ef.Id))
            .ToList();

        if (removedFieldValues.Count != 0)
        {
            _context.CustomFieldValues.RemoveRange(removedFieldValues);
        }
    }

    public async Task DeleteCustomFieldValue(Guid id)
    {
        var customFieldValue = await _context.CustomFieldValues.FirstOrDefaultAsync(c => c.Id == id);
        _context.Remove(customFieldValue);
        await _context.SaveChangesAsync();
    }

}