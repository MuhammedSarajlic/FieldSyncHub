using backend.Dtos.CustomFieldDto;
using backend.Models;
using backend.Response;

namespace backend.Services.CustomFieldService;

public interface ICustomFieldService
{
    Task<ApiResponse<List<CustomField>>> GetCustomFields();
    Task<ApiResponse<CustomField>> GetCustomFieldsById(Guid id);
    Task<ApiResponse<List<CustomField>>> GetCustomFieldsByWorkspaceId(Guid workspaceId);
    Task<CustomField> CreateCustomField(CreateCustomFieldDto createCustomFieldDto);
    Task<CustomField> UpdateCustomField(UpdateCustomFieldDto updatedCustomField);
    Task DeleteCustomField(Guid id);
}