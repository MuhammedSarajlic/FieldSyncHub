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
    public async Task<ActionResult<ApiResponse<CustomerPhone>>> CreateCustomerPhone([FromBody] CreateCustomerPhoneDto createCustomerPhoneDto)
    {
        var customerPhone = await _customerPhoneService.CreateCustomerPhone(createCustomerPhoneDto);
        return Ok(customerPhone);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateCustomerPhoneBulk([FromBody] List<CreateCustomerPhoneDto> createCustomerPhoneDtos, [FromQuery] Guid customerId)
    {
        await _customerPhoneService.CreateCustomerPhoneBulk(createCustomerPhoneDtos, customerId);
        return Ok();
    }

    [HttpPut]
    public async Task<ActionResult<CustomerPhone>> UpdateCustomerPhone([FromBody] UpdateCustomerPhoneDto updatedCustomerPhoneDto)
    {
        var customerPhone = await _customerPhoneService.UpdateCustomerPhone(updatedCustomerPhoneDto);
        return Ok(customerPhone);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomerPhone(Guid id)
    {
        await _customerPhoneService.DeleteCustomerPhone(id);
        return Ok();
    }
}