using backend.Dtos.CustomFieldValueDto;
using backend.Models;
using backend.Response;
using backend.Services.CustomFieldValueService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/custom-field-value")]
public class CustomFieldValueController : ControllerBase
{
    private readonly ICustomFieldServiceValue _customFieldServiceValue;

    public CustomFieldValueController(ICustomFieldServiceValue customFieldServiceValue)
    {
        _customFieldServiceValue = customFieldServiceValue;
    }


    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<CustomFieldValue>> GetCustomFieldValueById(Guid id)
    {
        return await _customFieldServiceValue.GetCustomFieldValuesById(id);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomField([FromBody] CreateCustomFieldValueDto createCustomFieldValueDto)
    {
        await _customFieldServiceValue.CreateCustomFieldValue(createCustomFieldValueDto);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCustomField([FromBody] UpdateCustomFieldValueDto updatedCustomFieldValueDto)
    {
        await _customFieldServiceValue.UpdateCustomFieldValue(updatedCustomFieldValueDto);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> DeleteCustomField(Guid id)
    {
        await _customFieldServiceValue.DeleteCustomFieldValue(id);
        return Ok();
    }

}
