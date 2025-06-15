using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services.ServiceItemService;

public interface IServiceItemService
{
    Task<ApiResponse<List<GetServiceItemDto>>> GetServiceItems();
    Task<GetServiceItemDto> GetServiceItemById(Guid id);
    Task<ApiResponse<List<GetServiceItemDto>>> GetServiceItemsByWorkspace(Guid workspaceId);
    Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter(ServiceItemFilterDto filterDto, Guid workspaceId);
    Task<GetServiceItemDto> CreateServiceItem(CreateServiceItemDto createServiceItemDto);
    Task<GetServiceItemDto> UpdateServiceItem(UpdateServiceItemDto updateServiceItemDto);
    Task<IActionResult> ExportServiceItemsToCsvAsync(Guid workspaceId);
    Task<ApiResponse<object>> ImportServiceItemsAsync(List<ImportedServiceItemDto> serviceItems, Guid workspaceId);
}