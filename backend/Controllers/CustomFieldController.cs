using backend.Dtos.CustomFieldDto;
using backend.Models;
using backend.Response;
using backend.Services.CustomFieldService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/customfield/")]
public class CustomFieldController : ControllerBase
{
    private readonly ICustomFieldService _customFieldService;

    public CustomFieldController(ICustomFieldService customFieldService)
    {
        _customFieldService = customFieldService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<CustomFields>>> GetCustomFields()
    {
        return await _customFieldService.GetCustomFields();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<CustomFields>> GetCustomFieldsById(Guid id)
    {
        return await _customFieldService.GetCustomFieldsById(id);
    }

    [HttpPost("{customerId:guid}")]
    public async Task<IActionResult> AddCustomField([FromBody]AddCustomFieldDto newCustomField,Guid customerId)
    {
        await _customFieldService.AddCustomField(newCustomField, customerId);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCustomField([FromQuery] UpdateCustomFieldDto updatedCustomField)
    {
        await _customFieldService.UpdateCustomField(updatedCustomField);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomField(Guid id)
    {
        await _customFieldService.DeleteCustomField(id);
        return Ok();
    }
}
