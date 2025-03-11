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

    [HttpGet]
    public async Task<ApiResponse<List<Property>>> GetProperties()
    {
        return await _propertyService.GetProperties();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<Property>> GetPropertyById(Guid id)
    {
        return await _propertyService.GetPropertyById(id);
    }

    [HttpPost]
    public async Task<IActionResult> AddProperty([FromBody] AddPropertyDto newProperty, Guid customerId)
    {
        await _propertyService.AddProperty(newProperty, customerId);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProperty([FromQuery] Property updatedProperty)
    {
        await _propertyService.UpdateProperty(updatedProperty);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProperty(Guid id)
    {
        await _propertyService.DeleteProperty(id);
        return Ok();
    }
}