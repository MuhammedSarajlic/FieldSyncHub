using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using backend.Services.ServiceItemService;
using backend.Wrappers;
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
    public async Task<ApiResponse<List<ServiceItem>>> GetAllServiceItems()
    {
        return await _serviceItemService.GetServiceItems();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceItem>> GetServiceItemById(Guid id)
    {
        var serviceItem = await _serviceItemService.GetServiceItemById(id);
        if (serviceItem == null) return NotFound();
        return Ok(serviceItem);
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ApiResponse<PagedResult<ServiceItem>>> GetByWorkspace(Guid workspaceId, [FromQuery] int pageNumber, [FromQuery] int pageSize)
    {
        var serviceItems = await _serviceItemService.GetServiceItemsByWorkspace(workspaceId, pageNumber, pageSize);
        return serviceItems;
    }

    [HttpGet("workspace/{workspaceId}/filter")]
    public async Task<ApiResponse<PagedResult<ServiceItem>>> GetServiceItemsByFilter(Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize, [FromQuery] ServiceItemFilterDto filterDto)
    {
        return await _serviceItemService.GetServiceItemsByFilter(filterDto, workspaceId, pageNumber, pageSize);
    }

    [HttpGet("stats/{workspaceId}")]
    public async Task<IActionResult> GetPricebookStats(Guid workspaceId)
    {
        var result = await _serviceItemService.GetPricebookStatsByWorkspace(workspaceId);

        if (result.Success)
        {
            return Ok(result);
        }
        return StatusCode(500, result);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceItem>> CreateServiceItem([FromBody] CreateServiceItemDto createServiceItemDto)
    {
        var createdServiceItem = await _serviceItemService.CreateServiceItem(createServiceItemDto);
        return Ok(createdServiceItem);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<ServiceItem>>> UpdateServiceItem([FromBody] UpdateServiceItemDto updateServiceItemDto)
    {
        var updatedServiceItem = await _serviceItemService.UpdateServiceItem(updateServiceItemDto);
        return Ok(updatedServiceItem);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteServiceItem(Guid id)
    {
        await _serviceItemService.DeleteServiceItem(id);
        return Ok();
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