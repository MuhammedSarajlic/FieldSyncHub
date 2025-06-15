using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;

namespace backend.Services.CustomerService;

public interface ICustomerUnitOfWork
{
    Task<ApiResponse<Customer>> UpdateCustomerWithDependenciesAsync(UpdateCustomerDto updatedCustomerDto);
}