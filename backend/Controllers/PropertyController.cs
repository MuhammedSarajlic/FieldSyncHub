using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;
using backend.Services.PropertyService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/property")]
public class PropertyController : ControllerBase
{
    private readonly IPropertyService _propertyService;

    public PropertyController(IPropertyService propertyService)
    {
        _propertyService = propertyService;
    }


    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<Property>> GetPropertyById(Guid id)
    {
        return await _propertyService.GetPropertyById(id);
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
        var property = await _propertyService.UpdateProperty(updatePropertyDto);
        return Ok(property);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProperty(Guid id)
    {
        await _propertyService.DeleteProperty(id);
        return Ok();
    }
}