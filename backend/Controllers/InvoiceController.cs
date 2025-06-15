using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using backend.Services.InvoiceService;
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

    [HttpGet]
    public async Task<ActionResult<List<Invoice>>> GetAllInvoices()
    {
        var invoices = await _invoiceService.GetAllInvoices();
        return Ok(invoices);
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

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<List<Invoice>>> GetInvoicesByWorkspaceId(Guid workspaceId)
    {
        var invoices = await _invoiceService.GetInvoicesByWorkspaceId(workspaceId);
        return Ok(invoices);
    }

    [HttpGet("workspace/{workspaceId}/filter")]
    public async Task<ActionResult<ApiResponse<List<Invoice>>>> GetInvoicesByFilter([FromQuery] InvoiceFilterDto filterDto, Guid workspaceId)
    {
        var response = await _invoiceService.GetInvoicesByFilter(filterDto, workspaceId);
        return Ok(response);
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

    [HttpPut("{invoiceId}")]
    public async Task<ActionResult<Invoice>> UpdateInvoice(Guid invoiceId, [FromBody] UpdateInvoiceDto updatedInvoiceDto)
    {
        var updatedInvoice = await _invoiceService.UpdateInvoice(invoiceId, updatedInvoiceDto);
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