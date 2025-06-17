using backend.Dtos.CustomerPhoneDto;
using backend.Models;
using backend.Response;

namespace backend.Services.CustomerPhoneService;

public interface ICustomerPhoneService
{
    Task<ApiResponse<List<CustomerPhone>>> GetCustomerPhones();
    Task<ApiResponse<CustomerPhone>> GetCustomerPhoneById(Guid id);
    Task<ApiResponse<CustomerPhone>> CreateCustomerPhone(CreateCustomerPhoneDto createCustomerPhoneDto);
    Task CreateCustomerPhoneBulk(List<CreateCustomerPhoneDto> createCustomerPhoneDtos, Guid customerId);
    Task<CustomerPhone> UpdateCustomerPhone(UpdateCustomerPhoneDto updatedCustomerPhoneDto);
    Task UpdateCustomerPhones(ICollection<UpdateCustomerPhoneDto> updatedCustomerPhonesDto, Guid customerId);
    Task DeleteCustomerPhone(Guid id);
}