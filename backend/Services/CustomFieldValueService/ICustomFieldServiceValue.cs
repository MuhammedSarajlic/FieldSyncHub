using backend.Dtos.CustomFiledValueDto;
using backend.Models;
using backend.Response;

namespace backend.Services.CustomFieldValueService;

public interface ICustomFieldServiceValue
{
    Task<ApiResponse<List<CustomFiledValue>>> GetCustomFieldValues();
    Task<ApiResponse<CustomFiledValue>> GetCustomFieldValuesById(Guid id);
    Task AddCustomFieldValue(AddCustomFiledValueDto newCustomFieldValue, Guid customFieldId);
    Task UpdateCustomFieldValue(UpdateCustomFiledValueDto updatedCustomFieldValue);
    Task DeleteCustomFieldValue(Guid id);
}