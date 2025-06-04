using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.CustomerService;

public interface ICustomerService
{
    Task<ApiResponse<List<Customers>>> GetCustomers();
    Task<ApiResponse<Customers>> GetCustomersById(Guid id);
    Task<ApiResponse<PagedResult<Customers>>> GetCustomersByWorkspace(Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<PagedResult<Customers>>> GetCustomersByFilter(
        int pageNumber, int pageSize,
        Guid workspaceId,
        string? q, string? sortBy, string? sort,
        string? customerType,
        string? createdDateMin,
        string? createdDateMax,
        string? propertiesMin,
        string? propertiesMax,
        string? hasEmail,
        string? hasPhone,
        string? tags
    );
    Task<ApiResponse<object>> ImportCustomers(List<ImportedCustomerDto> customers, Guid workspaceId);
    Task<ApiResponse<List<ImportedCustomerDto>>> ExportCustomers(Guid workspaceId);
    Task AddCustomer(Customers newCustomer);
    Task UpdateCustomer(Customers updatedCustomer);
    Task UpdateCustomerTags(Guid id, string tag);
    Task RemoveCustomerTag(Guid id, string tag);
    Task ArchiveCustomer(Guid id);
    Task DeleteCustomer(Guid id);
    Task<int> GetTotalCustomerCount();
    Task<object> GetCompanyAndIndividualCount();
    Task<int> GetNewCustomersCount();
    Task<int> GetCustomerMissingInfoCount();
}