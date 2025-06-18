using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services.ServiceItemService;

public interface IServiceItemService
{
    Task<ApiResponse<List<ServiceItem>>> GetServiceItems();
    Task<ServiceItem> GetServiceItemById(Guid id);
    Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByWorkspace(Guid workspaceId);
    Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter(ServiceItemFilterDto filterDto, Guid workspaceId);
    Task<ServiceItem> CreateServiceItem(CreateServiceItemDto createServiceItemDto);
    Task<ApiResponse<ServiceItem>> UpdateServiceItem(UpdateServiceItemDto updateServiceItemDto);
    Task DeleteServiceItem(Guid id);
    Task<IActionResult> ExportServiceItemsToCsvAsync(Guid workspaceId);
    Task<ApiResponse<object>> ImportServiceItemsAsync(List<ImportedServiceItemDto> serviceItems, Guid workspaceId);
}