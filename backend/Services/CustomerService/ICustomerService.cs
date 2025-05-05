using backend.Models;
using backend.Response;

namespace backend.Services.CustomerService;

public interface ICustomerService
{
    Task<ApiResponse<List<Customers>>> GetCustomers();
    Task<ApiResponse<Customers>> GetCustomersById(Guid id);
    Task AddCustomer(Customers newCustomer);
    Task UpdateCustomer(Customers updatedCustomer);
    Task UpdateCustomerTags(Guid customerId, string tag);
    Task RemoveCustomerTag(Guid customerId, string tag);
    Task ArchiveCustomer(Guid customerId);
    Task DeleteCustomer(Guid id);
}