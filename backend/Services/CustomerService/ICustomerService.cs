using backend.Models;
using backend.Response;

namespace backend.Services.CustomerService;

public interface ICustomerService
{
    Task<ApiResponse<List<Customers>>> GetCustomers();
    Task<ApiResponse<Customers>> GetCustomersById(Guid id);
    Task AddCustomer(Customers newCustomer);
    Task UpdateCustomer(Customers updatedCustomer);
    Task DeleteCustomer(Guid id);
}