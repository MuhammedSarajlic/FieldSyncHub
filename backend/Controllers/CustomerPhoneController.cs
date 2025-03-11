using backend.Dtos.CustomerPhoneDto;
using backend.Models;
using backend.Response;
using backend.Services.Phones;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/customerphone")]
public class CustomerPhoneController : Controller
{
    private readonly ICustomerPhoneService _customerPhoneService;

    public CustomerPhoneController(ICustomerPhoneService customerPhoneService)
    {
        _customerPhoneService = customerPhoneService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<CustomerPhone>>> GetCustomerPhone()
    {
        return await _customerPhoneService.GetCustomerPhones();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<CustomerPhone>> GetCustomerPhoneById(Guid id)
    {
        return await _customerPhoneService.GetCustomerPhoneById(id);
    }

    [HttpPost]
    public async Task<IActionResult> AddCustomerPhone([FromQuery] AddCustomerPhoneDto newCustomerPhone, Guid customerId)
    {
        await _customerPhoneService.AddCustomerPhone(newCustomerPhone, customerId);
        return Ok();
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> AddBulkPhone([FromBody] List<AddCustomerPhoneDto> customerPhones, Guid customerId)
    {
        await _customerPhoneService.AddBulkPhone(customerPhones, customerId);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCustomerPhone([FromQuery] CustomerPhone updatedCustomerPhone)
    {
        await _customerPhoneService.UpdateCustomerPhone(updatedCustomerPhone);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomerPhone(Guid id)
    {
        await _customerPhoneService.DeleteCustomerPhone(id);
        return Ok();
    }
}