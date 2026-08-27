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


    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<CustomField>> GetCustomFieldsById(Guid id)
    {
        return await _customFieldService.GetCustomFieldsById(id);
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<List<CustomField>>> GetCustomFieldsByWorkspaceId(Guid workspaceId)
    {
        return await _customFieldService.GetCustomFieldsByWorkspaceId(workspaceId);
    }

    [HttpPost]
    public async Task<ActionResult<CustomField>> CreateCustomField([FromBody] CreateCustomFieldDto createCustomFieldDto)
    {
        var customField = await _customFieldService.CreateCustomField(createCustomFieldDto);
        return Ok(customField);
    }

    [HttpPut]
    public async Task<ActionResult<CustomField>> UpdateCustomField([FromBody] UpdateCustomFieldDto updatedCustomField)
    {
        var customField = await _customFieldService.UpdateCustomField(updatedCustomField);
        return Ok(customField);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomField(Guid id)
    {
        await _customFieldService.DeleteCustomField(id);
        return Ok();
    }
}
