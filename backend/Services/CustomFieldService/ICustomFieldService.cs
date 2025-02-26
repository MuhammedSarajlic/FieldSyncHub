using backend.Dtos.CustomFieldDto;
using backend.Models;
using backend.Response;

namespace backend.Services.CustomFieldService;

public interface ICustomFieldService
{
    Task<ApiResponse<List<CustomFields>>> GetCustomFields();
    Task<ApiResponse<CustomFields>> GetCustomFieldsById(Guid id);
    Task AddCustomField(AddCustomFieldDto newCustomField, Guid customerId);
    Task UpdateCustomField(UpdateCustomFieldDto updatedCustomField);
    Task DeleteCustomField(Guid id);
}