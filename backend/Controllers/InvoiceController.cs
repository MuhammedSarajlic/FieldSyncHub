using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.InvoiceService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/invoice")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly ICurrentUser _currentUser;

    public InvoiceController(IInvoiceService invoiceService, ICurrentUser currentUser)
    {
        _invoiceService = invoiceService;
        _currentUser = currentUser;
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoiceById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var invoice = await _invoiceService.GetInvoiceById(id, callerWorkspaceId);
        return Ok(invoice);
    }

    [HttpGet("invoice-number/{invoiceNumber}")]
    public async Task<ActionResult<Invoice>> GetByInvoiceNumber(string invoiceNumber)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        var invoice = await _invoiceService.GetInvoiceByInvoiceNumber(workspaceId, invoiceNumber);
        return Ok(invoice);
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByWorkspaceId(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize)
    {
        return await _invoiceService.GetInvoicesByWorkspaceId(workspaceId, pageNumber, pageSize);
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] InvoiceFilterDto filterDto)
    {
        return await _invoiceService.GetInvoicesByFilter(filterDto, workspaceId, pageNumber, pageSize);
    }

    [HttpGet("workspace/{workspaceId:guid}/invoice-stats")]
    public async Task<ApiResponse<InvoiceStatsDto>> GetInvoiceStats(Guid workspaceId)
    {
        var stats = await _invoiceService.GetInvoiceStats(workspaceId);
        return new ApiResponse<InvoiceStatsDto>
        {
            Success = true,
            Payload = stats
        };
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<List<Invoice>>>> GetInvoicesByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return await _invoiceService.GetInvoicesByCustomerId(customerId, callerWorkspaceId);
    }

    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] CreateInvoiceDto createInvoiceDto)
    {
        var createdInvoice = await _invoiceService.CreateInvoice(createInvoiceDto);
        return Ok(createdInvoice);
    }

    [HttpPut]
    public async Task<ActionResult<Invoice>> UpdateInvoice([FromBody] UpdateInvoiceDto updatedInvoiceDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var updatedInvoice = await _invoiceService.UpdateInvoice(updatedInvoiceDto, callerWorkspaceId);
        return Ok(updatedInvoice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        await _invoiceService.DeleteInvoice(id, callerWorkspaceId);
        return Ok();
    }

    [HttpGet("invoice/{id}/pdf")]
    public async Task<IActionResult> GetInvoicePdf(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var invoice = await _invoiceService.GetInvoiceById(id, callerWorkspaceId);
        var document = _invoiceService.GenerateDocument(invoice);

        return File(document, "application/pdf", $"invoice-{id}.pdf");
    }
}