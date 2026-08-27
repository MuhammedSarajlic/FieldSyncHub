using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.PropertyService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/property")]
public class PropertyController : ControllerBase
{
    private readonly IPropertyService _propertyService;
    private readonly ICurrentUser _currentUser;

    public PropertyController(IPropertyService propertyService, ICurrentUser currentUser)
    {
        _propertyService = propertyService;
        _currentUser = currentUser;
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<Property>>> GetPropertyById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _propertyService.GetPropertyById(id, callerWorkspaceId));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Property>>> CreateProperty([FromBody] CreatePropertyDto createPropertyDto)
    {
        var property = await _propertyService.CreateProperty(createPropertyDto);
        return Ok(property);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<Property>>> UpdateProperty([FromBody] UpdatePropertyDto updatePropertyDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var property = await _propertyService.UpdateProperty(updatePropertyDto, callerWorkspaceId);
        return Ok(property);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProperty(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _propertyService.DeleteProperty(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        return Ok();
    }
}