using backend.Dtos.CustomFiledValueDto;
using backend.Models;
using backend.Response;
using backend.Services.CustomFieldValueService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/customfieldvalue/")]
public class CustomFieldValueController : ControllerBase
{
    private readonly ICustomFieldServiceValue _customFieldServiceValue;

    public CustomFieldValueController(ICustomFieldServiceValue customFieldServiceValue)
    {
        _customFieldServiceValue = customFieldServiceValue;
    }

    [HttpGet]
    public async Task<ApiResponse<List<CustomFiledValue>>> GetCustomFieldValues()
    {
        return await _customFieldServiceValue.GetCustomFieldValues();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<CustomFiledValue>> GetCustomFieldValueById(Guid id)
    {
        return await _customFieldServiceValue.GetCustomFieldValuesById(id);
    }

    [HttpPost("{customFieldId:guid}")]
    public async Task<IActionResult> AddCustomField([FromBody] AddCustomFiledValueDto newCustomFieldValue, Guid customFieldId)
    {
        await _customFieldServiceValue.AddCustomFieldValue(newCustomFieldValue, customFieldId);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCustomField([FromQuery] UpdateCustomFiledValueDto updatedCustomFieldValue)
    {
        await _customFieldServiceValue.UpdateCustomFieldValue(updatedCustomFieldValue);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomField(Guid id)
    {
        await _customFieldServiceValue.DeleteCustomFieldValue(id);
        return Ok();
    }

}