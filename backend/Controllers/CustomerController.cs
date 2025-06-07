using backend.Dtos.CustomerDto;
using backend.Models;
using backend.Response;
using backend.Services.CustomerService;
using backend.Wrappers;
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

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<Customers>>> GetCustomersByWorkspace(Guid workspaceId, [FromQuery] int pageNumber, [FromQuery] int pageSize)
    {
        return await _customerService.GetCustomersByWorkspace(workspaceId, pageNumber, pageSize);
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<Customers>>> GetCustomersByFilter(
            Guid workspaceId,
            [FromQuery] int pageNumber,
            [FromQuery] int pageSize,
            [FromQuery] string? q,
            [FromQuery] string? sortBy,
            [FromQuery] string? sort,
            [FromQuery] string? customerType,
            [FromQuery] string? createdDateMin,
            [FromQuery] string? createdDateMax,
            [FromQuery] string? propertiesMin,
            [FromQuery] string? propertiesMax,
            [FromQuery] string? hasEmail,
            [FromQuery] string? hasPhone,
            [FromQuery] string? tags
        )
    {
        return await _customerService.GetCustomersByFilter(pageNumber, pageSize, workspaceId, q, sortBy, sort, customerType, createdDateMin, createdDateMax, propertiesMin, propertiesMax, hasEmail, hasPhone, tags);
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportCustomers(
        [FromBody] List<ImportedCustomerDto> customers,
        Guid workspaceId)
    {
        var result = await _customerService.ImportCustomers(customers, workspaceId);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCustomersAsCsv(Guid workspaceId)
    {
        var result = await _customerService.ExportCustomers(workspaceId);

        if (!result.Success || result.Payload == null)
            return BadRequest(result);

        var csvContent = GenerateCsv(result.Payload);
        var fileName = $"customers_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        var bytes = System.Text.Encoding.UTF8.GetBytes(csvContent);

        return File(bytes, "text/csv", fileName);
    }

    private string GenerateCsv(List<ImportedCustomerDto> customers)
    {
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("FirstName,LastName,CompanyName,IsCompany,Email,Tags,VisitReminders,JobFollowUps,QuoteFollowUps,InvoiceFollowUps,Archived,CreatedAt");

        foreach (var c in customers)
        {
            var emails = string.Join(";", c.Email ?? new List<string>());
            var tags = string.Join(";", c.Tags ?? new List<string>());
            var createdAt = c.CreatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";

            csv.AppendLine($"{Escape(c.FirstName)},{Escape(c.LastName)},{Escape(c.CompanyName)},{c.IsCompany},{Escape(emails)},{Escape(tags)},{c.VisitReminders},{c.JobFollowUps},{c.QuoteFollowUps},{c.InvoiceFollowUps},{c.Archived},{createdAt}");
        }

        return csv.ToString();
    }

    private string Escape(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "";
        value = value.Replace("\"", "\"\"");
        return $"\"{value}\"";
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

    [HttpPatch("{id}/tags")]
    public async Task<IActionResult> UpdateCustomerTags(Guid id, [FromBody] string tag)
    {
        await _customerService.UpdateCustomerTags(id, tag);
        return Ok();
    }

    [HttpPatch("{id}/tags/remove")]
    public async Task<IActionResult> RemoveCustomerTag(Guid id, [FromBody] string tag)
    {
        await _customerService.RemoveCustomerTag(id, tag);
        return Ok();
    }

    [HttpPatch("{id}/archive")]
    public async Task<IActionResult> ArchiveCustomer(Guid id)
    {
        await _customerService.ArchiveCustomer(id);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        await _customerService.DeleteCustomer(id);
        return Ok();
    }

    [HttpGet("stats/{workspaceId:guid}")]
    public async Task<IActionResult> GetCustomerStats(Guid workspaceId)
    {
        CustomerStatsDto stats = await _customerService.GetCustomerStats(workspaceId);
        return Ok(stats);
    }
}
