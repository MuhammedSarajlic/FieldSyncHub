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

    public async Task<ApiResponse<CustomField>> GetCustomFieldsById(Guid id)
    {
        var customFields = await _context.CustomFields.FirstOrDefaultAsync(c => c.Id == id);
        return new ApiResponse<CustomField>()
        {
            Success = true,
            Payload = customFields,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<CustomField>>> GetCustomFieldsByWorkspaceId(Guid workspaceId)
    {
        var customFields = await _context.CustomFields.Where(c => c.WorkspaceId == workspaceId)
                                        .ToListAsync();

        return new ApiResponse<List<CustomField>>
        {
            Success = true,
            Payload = customFields,
            ErrorMessage = null
        };
    }

    public async Task<CustomField> CreateCustomField(CreateCustomFieldDto createCustomFieldDto)
    {
        var customField = createCustomFieldDto.Adapt<CustomField>();
        customField.Id = Guid.NewGuid();

        await _context.CustomFields.AddAsync(customField);
        await _context.SaveChangesAsync();

        return customField;
    }

    public async Task<CustomField> UpdateCustomField(UpdateCustomFieldDto updatedCustomField)
    {
        if (updatedCustomField.Id == null || updatedCustomField.Id == Guid.Empty)
            throw new ArgumentException("Custom field ID is required.");

        var existing = await _context.CustomFields.FindAsync(updatedCustomField.Id);

        if (existing == null)
            throw new KeyNotFoundException("Custom field not found.");

        if (!string.IsNullOrWhiteSpace(updatedCustomField.FieldName))
            existing.FieldName = updatedCustomField.FieldName;

        if (updatedCustomField.FieldType.HasValue)
            existing.FieldType = updatedCustomField.FieldType.Value;

        if (updatedCustomField.DefaultValue != null)
            existing.DefaultValue = updatedCustomField.DefaultValue;

        if (updatedCustomField.DropdownOptions != null)
            existing.DropdownOptions = updatedCustomField.DropdownOptions;

        if (updatedCustomField.IsRequired.HasValue)
            existing.IsRequired = updatedCustomField.IsRequired.Value;

        if (updatedCustomField.IsArchived.HasValue)
            existing.IsArchived = updatedCustomField.IsArchived.Value;

        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return existing;
    }

    public async Task DeleteCustomField(Guid id)
    {
        var customField = await _context.CustomFields.FirstOrDefaultAsync(c => c.Id == id);
        if (customField == null)
        {
            return;
        }

        _context.Remove(customField);
        await _context.SaveChangesAsync();
    }
}
