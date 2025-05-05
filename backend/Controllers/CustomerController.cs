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
    public async Task<IActionResult> AddCustomer([FromBody] Customers newCustomer)
    {
        await _customerService.AddCustomer(newCustomer);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCustomer([FromBody] Customers updatedCustomer)
    {
        await _customerService.UpdateCustomer(updatedCustomer);
        return Ok();
    }

    [HttpPatch("{customerId}/tags")]
    public async Task<IActionResult> UpdateCustomerTags(Guid customerId, [FromBody] string tag)
    {
        await _customerService.UpdateCustomerTags(customerId, tag);
        return Ok();
    }

    [HttpPatch("{customerId}/tags/remove")]
    public async Task<IActionResult> RemoveCustomerTag(Guid customerId, [FromBody] string tag)
    {
        await _customerService.RemoveCustomerTag(customerId, tag);
        return Ok();
    }

    [HttpPatch("{customerId}/archive")]
    public async Task<IActionResult> ArchiveCustomer(Guid customerId)
    {
        await _customerService.ArchiveCustomer(customerId);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        await _customerService.DeleteCustomer(id);
        return Ok();
    }
}
