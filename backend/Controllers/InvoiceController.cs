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
    public async Task<ActionResult<IEnumerable<Invoice>>> GetAll()
    {
        var invoices = await _invoiceService.GetAllInvoices();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetById(Guid id)
    {
        var invoice = await _invoiceService.GetInvoiceById(id);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpGet("invoice-number/{invoiceNumber}")]
    public async Task<ActionResult<Invoice>> GetByInvoiceNumber(string invoiceNumber)
    {
        var invoice = await _invoiceService.GetInvoiceByInvoiceNumber(invoiceNumber);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetByWorkspaceId(Guid workspaceId)
    {
        var invoices = await _invoiceService.GetInvoicesByWorkspaceId(workspaceId);
        return Ok(invoices);
    }

    [HttpPost]
    public async Task<ActionResult<Invoice>> Create([FromBody] CreateInvoiceDto invoiceDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var createdInvoice = await _invoiceService.CreateInvoice(invoiceDto);
        return CreatedAtAction(nameof(GetById), new { id = createdInvoice.InvoiceId }, createdInvoice);
    }

    [HttpPut("{invoiceId}")]
    public async Task<IActionResult> Update(Guid invoiceId, [FromBody] UpdateInvoiceDto invoiceDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var updatedInvoice = await _invoiceService.UpdateInvoice(invoiceId, invoiceDto);
        if (updatedInvoice == null)
        {
            return NotFound();
        }
        return Ok(updatedInvoice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _invoiceService.DeleteInvoice(id);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpGet("invoice/{id}/pdf")]
    public async Task<IActionResult> GetInvoicePdf(Guid id)
    {
        var invoice = await _invoiceService.GetInvoiceById(id);
        if (invoice == null)
            return NotFound();

        var document = _invoiceService.GenerateDocument(invoice);

        return File(document, "application/pdf", $"invoice-{id}.pdf");
    }
    [HttpGet("filter")]
    public async Task<ActionResult<ApiResponse<List<Invoice>>>> GetByFilter(
    [FromQuery] Guid? workspaceId,
    [FromQuery] string? status,
    [FromQuery] DateTime? dueDateMin,
    [FromQuery] DateTime? dueDateMax,
    [FromQuery] decimal? totalMin,
    [FromQuery] decimal? totalMax,
    [FromQuery] string? sortBy,
    [FromQuery] string? sort)
    {
        var response = await _invoiceService.GetInvoicesByFilter(
            workspaceId,
            status,
            dueDateMin,
            dueDateMax,
            totalMin,
            totalMax,
            sortBy,
            sort
        );

        return Ok(response);
    }
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<Invoice>> GetByCustomerId(Guid customerId)
    {
        var invoice = await _invoiceService.GetInvoiceByCustomerId(customerId);
        if (invoice == null)
        {
            return NotFound();
        }
        return Ok(invoice);
    }
}