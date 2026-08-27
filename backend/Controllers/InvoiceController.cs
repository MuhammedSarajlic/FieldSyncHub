using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using backend.Services.InvoiceService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/invoice")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoiceById(Guid id)
    {
        var invoice = await _invoiceService.GetInvoiceById(id);
        return Ok(invoice);
    }

    [HttpGet("invoice-number/{invoiceNumber}")]
    public async Task<ActionResult<Invoice>> GetByInvoiceNumber([FromQuery] Guid workspaceId, string invoiceNumber)
    {
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
        return await _invoiceService.GetInvoicesByCustomerId(customerId);
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
        var updatedInvoice = await _invoiceService.UpdateInvoice(updatedInvoiceDto);
        return Ok(updatedInvoice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _invoiceService.DeleteInvoice(id);
        return Ok();
    }

    [HttpGet("invoice/{id}/pdf")]
    public async Task<IActionResult> GetInvoicePdf(Guid id)
    {
        var invoice = await _invoiceService.GetInvoiceById(id);
        var document = _invoiceService.GenerateDocument(invoice);

        return File(document, "application/pdf", $"invoice-{id}.pdf");
    }
}