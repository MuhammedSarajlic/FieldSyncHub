using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services.CustomerService;

public interface ICustomerService
{
    Task<ApiResponse<object>> GetCustomerById(Guid id);
    Task<ApiResponse<PagedResult<Customer>>> GetCustomersByWorkspace(Guid workspaceId, int pageNumber, int pageSize);
    Task<CustomerStatsDto> GetCustomerStats(Guid workspaceId);
    Task<ApiResponse<PagedResult<Customer>>> GetCustomersByFilter(
        Guid workspaceId,
        int pageNumber,
        int pageSize,
        CustomerFilterDto filterDto
    );
    Task<ApiResponse<Customer>> CreateCustomer(CreateCustomerDto createCustomerDto);
    Task<ApiResponse<Customer>> UpdateCustomer(UpdateCustomerDto updatedCustomerDto);
    Task DeleteCustomer(Guid id);
    Task<ApiResponse<List<Customer>>> ImportCustomers(List<ImportedCustomerDto> customers, Guid workspaceId);
    Task<IActionResult> ExportCustomers(Guid workspaceId);
    Task UpdateCustomerTags(Guid id, string tag);
    Task RemoveCustomerTag(Guid id, string tag);
    Task ArchiveCustomer(Guid id);
    Task<ApiResponse<object>> SendCustomerMail(Guid customerId, string to, string subject, string message, Guid callerWorkspaceId);

}