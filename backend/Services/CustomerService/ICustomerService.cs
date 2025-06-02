using backend.Models;
using backend.Response;

namespace backend.Services.CustomerService;

public interface ICustomerService
{
    Task<ApiResponse<List<Customers>>> GetCustomers();
    Task<ApiResponse<Customers>> GetCustomersById(Guid id);
    Task<ApiResponse<List<Customers>>> GetCustomersByWorkspace(Guid workspaceId);
    Task<ApiResponse<List<Customers>>> GetCustomersByFilter(
        Guid workspaceId, string? q, string? sortBy, string? sort,
        string? customerType,
        string? createdDateMin,
        string? createdDateMax,
        string? propertiesMin,
        string? propertiesMax,
        string? hasEmail,
        string? hasPhone,
        string? tags
    );
    Task AddCustomer(Customers newCustomer);
    Task UpdateCustomer(Customers updatedCustomer);
    Task UpdateCustomerTags(Guid id, string tag);
    Task RemoveCustomerTag(Guid id, string tag);
    Task ArchiveCustomer(Guid id);
    Task DeleteCustomer(Guid id);
}