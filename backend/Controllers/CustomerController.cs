using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.CustomerService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

[ApiController]
[Route("api/customer")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly ICustomerUnitOfWork _customerUnitOfWork;
    private readonly ICurrentUser _currentUser;

    public CustomerController(ICustomerService customerService, ICustomerUnitOfWork customerUnitOfWork, ICurrentUser currentUser)
    {
        _customerService = customerService;
        _customerUnitOfWork = customerUnitOfWork;
        _currentUser = currentUser;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> GetCustomerById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _customerService.GetCustomerById(id, callerWorkspaceId));
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<Customer>>> GetCustomersByWorkspace(Guid workspaceId, [FromQuery] int pageNumber, [FromQuery] int pageSize)
    {
        return await _customerService.GetCustomersByWorkspace(workspaceId, pageNumber, pageSize);
    }

    [HttpGet("stats/{workspaceId:guid}")]
    public async Task<IActionResult> GetCustomerStats(Guid workspaceId)
    {
        CustomerStatsDto stats = await _customerService.GetCustomerStats(workspaceId);
        return Ok(stats);
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<Customer>>> GetCustomersByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] CustomerFilterDto filterDto
    )
    {
        return await _customerService.GetCustomersByFilter(workspaceId, pageNumber, pageSize, filterDto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Customer>>> CreateCustomer([FromBody] CreateCustomerDto createCustomerDto)
    {
        var customer = await _customerService.CreateCustomer(createCustomerDto);
        return Ok(customer);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<Customer>>> UpdateCustomer([FromBody] UpdateCustomerDto updatedCustomerDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var customer = await _customerUnitOfWork.UpdateCustomerWithDependenciesAsync(updatedCustomerDto, callerWorkspaceId);
        return Ok(customer);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _customerService.DeleteCustomer(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        return Ok();
    }

    [HttpPost("import")]
    public async Task<ActionResult<ApiResponse<List<Customer>>>> ImportCustomers(
        [FromBody] List<ImportedCustomerDto> customers)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        var result = await _customerService.ImportCustomers(customers, workspaceId);
        return Ok(result);
    }

    [HttpGet("export/{workspaceId:guid}")]
    public async Task<IActionResult> ExportCustomers(Guid workspaceId)
    {
        return await _customerService.ExportCustomers(workspaceId);
    }

    [HttpPatch("{id}/tags")]
    public async Task<IActionResult> UpdateCustomerTags(Guid id, [FromBody] string tag)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        await _customerService.UpdateCustomerTags(id, tag, callerWorkspaceId);
        return Ok();
    }

    [HttpPatch("{id}/tags/remove")]
    public async Task<IActionResult> RemoveCustomerTag(Guid id, [FromBody] string tag)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        await _customerService.RemoveCustomerTag(id, tag, callerWorkspaceId);
        return Ok();
    }

    [HttpPatch("{id}/archive")]
    public async Task<IActionResult> ArchiveCustomer(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        await _customerService.ArchiveCustomer(id, callerWorkspaceId);
        return Ok();
    }

    [HttpPost("send-mail")]
    [EnableRateLimiting("email-relay")]
    public async Task<IActionResult> SendCustomerMail(
        [FromQuery] Guid customerId,
        [FromQuery] string to,
        [FromQuery] string message,
        [FromQuery] string subject)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        var result = await _customerService.SendCustomerMail(customerId, to, subject, message, workspaceId);
        return Ok(result);
    }
}
