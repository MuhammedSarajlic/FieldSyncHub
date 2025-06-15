using backend.Dtos.CustomFieldValueDto;
using backend.Models;
using backend.Response;

namespace backend.Services.CustomFieldValueService;

public interface ICustomFieldServiceValue
{
    Task<ApiResponse<List<CustomFieldValue>>> GetCustomFieldValues();
    Task<ApiResponse<CustomFieldValue>> GetCustomFieldValuesById(Guid id);
    Task<CustomFieldValue> CreateCustomFieldValue(CreateCustomFieldValueDto createCustomFieldValueDto);
    Task<CustomFieldValue> UpdateCustomFieldValue(UpdateCustomFieldValueDto updatedCustomFieldValueDto);
    Task UpdateCustomFieldValues(ICollection<UpdateCustomFieldValueDto> updatedCustomFieldValuesDto, Guid customerId);
    Task DeleteCustomFieldValue(Guid id);
}