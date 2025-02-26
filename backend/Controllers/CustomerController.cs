using backend.Models;
using backend.Response;
using backend.Services.CustomerService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/customer")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<Customers>>> GetCustomers()
    {
        return await _customerService.GetCustomers();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<Customers>> GetCustomersById(Guid id)
    {
        return await _customerService.GetCustomersById(id);
    }

    [HttpPost]
    public async Task<IActionResult> AddCustomer([FromQuery] Customers newCustomer)
    {
        await _customerService.AddCustomer(newCustomer);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCustomer([FromQuery] Customers updatedCustomer)
    {
        await _customerService.UpdateCustomer(updatedCustomer);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        await _customerService.DeleteCustomer(id);
        return Ok();
    }
}
