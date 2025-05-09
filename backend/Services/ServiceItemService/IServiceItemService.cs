using backend.Models;
using backend.Response;

namespace backend.Services.ServiceItemService;

public interface IServiceItemService
{
    Task<ApiResponse<List<ServiceItem>>> GetServiceItems();
    Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter(
    string? q, string? sortBy, string? sort, string? category,
    string? priceMin, string? priceMax, string? hoursMin, string? hoursMax,
    string? status, string? images, string? description
);
    Task CreateServiceItem(ServiceItem serviceItem);
}