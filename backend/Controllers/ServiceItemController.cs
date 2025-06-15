using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using backend.Services.ServiceItemService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/service-item")]
public class ServiceItemController : ControllerBase
{
    private readonly IServiceItemService _serviceItemService;

    public ServiceItemController(IServiceItemService serviceItemService)
    {
        _serviceItemService = serviceItemService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<GetServiceItemDto>>> GetAllServiceItems()
    {
        return await _serviceItemService.GetServiceItems();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GetServiceItemDto>> GetServiceItemById(Guid id)
    {
        var serviceItem = await _serviceItemService.GetServiceItemById(id);
        if (serviceItem == null) return NotFound();
        return Ok(serviceItem);
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ApiResponse<List<GetServiceItemDto>>> GetByWorkspace(Guid workspaceId)
    {
        var serviceItems = await _serviceItemService.GetServiceItemsByWorkspace(workspaceId);
        return serviceItems;
    }

    [HttpGet("workspace/{workspaceId}/filter")]
    public async Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter([FromQuery] ServiceItemFilterDto filterDto, Guid workspaceId)
    {
        return await _serviceItemService.GetServiceItemsByFilter(filterDto, workspaceId);
    }

    [HttpPost]
    public async Task<ActionResult<GetServiceItemDto>> CreateServiceItem([FromBody] CreateServiceItemDto createServiceItemDto)
    {
        var createdServiceItem = await _serviceItemService.CreateServiceItem(createServiceItemDto);
        return Ok(createdServiceItem);
    }

    [HttpPut]
    public async Task<ActionResult<GetServiceItemDto>> Update([FromBody] UpdateServiceItemDto updateServiceItemDto)
    {
        var updatedServiceItem = await _serviceItemService.UpdateServiceItem(updateServiceItemDto);
        return Ok(updatedServiceItem);
    }

    [HttpPost("import/{workspaceId}")]
    public async Task<ApiResponse<object>> ImportServiceItems([FromBody] List<ImportedServiceItemDto> serviceItems, Guid workspaceId)
    {
        return await _serviceItemService.ImportServiceItemsAsync(serviceItems, workspaceId);
    }

    [HttpGet("export/{workspaceId}")]
    public async Task<IActionResult> ExportServiceItems(Guid workspaceId)
    {
        return await _serviceItemService.ExportServiceItemsToCsvAsync(workspaceId);
    }
}