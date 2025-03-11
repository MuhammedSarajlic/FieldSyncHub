using backend.Dtos.CustomerPhoneDto;
using backend.Models;
using backend.Response;

namespace backend.Services.Phones
{
    public interface ICustomerPhoneService
    {
        Task<ApiResponse<List<CustomerPhone>>> GetCustomerPhones();
        Task<ApiResponse<CustomerPhone>> GetCustomerPhoneById(Guid id);
        Task AddCustomerPhone(AddCustomerPhoneDto newCustomerPhone, Guid customerId);
        Task UpdateCustomerPhone(CustomerPhone updatedCustomerPhone);
        Task DeleteCustomerPhone(Guid id);
        Task AddBulkPhone(List<AddCustomerPhoneDto> customerPhones, Guid customerId);
    }
}