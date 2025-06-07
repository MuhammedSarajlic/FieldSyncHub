using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using backend.Services.ServiceItemService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
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
        public async Task<ApiResponse<List<ServiceItem>>> GetServiceItems()
        {
            return await _serviceItemService.GetServiceItems();
        }

        [HttpGet("filter")]
        public async Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter(
            [FromQuery] string? q,
            [FromQuery] string? sortBy,
            [FromQuery] string? sort,
            [FromQuery] string? category,
            [FromQuery] string? priceMin,
            [FromQuery] string? priceMax,
            [FromQuery] string? hoursMin,
            [FromQuery] string? hoursMax,
            [FromQuery] string? status,
            [FromQuery] string? images,
            [FromQuery] string? description
        )
        {
            return await _serviceItemService.GetServiceItemsByFilter(q, sortBy, sort, category, priceMin, priceMax, hoursMin, hoursMax, status, images, description);
        }

        [HttpPost]
        public async Task<IActionResult> CreateServiceItem([FromBody] ServiceItem serviceItem)
        {
            await _serviceItemService.CreateServiceItem(serviceItem);
            return Ok();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportServiceItems([FromBody] List<ImportedServiceItemDto> items)
        {
            var result = await _serviceItemService.ImportServiceItems(items);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportServiceItems()
        {
            var result = await _serviceItemService.ExportServiceItems();
            return Ok(result);
        }
    }
}