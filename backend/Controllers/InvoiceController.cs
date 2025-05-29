using backend.Dtos.InvoiceDto;
using backend.Models;
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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInvoiceDto invoiceDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var updatedInvoice = await _invoiceService.UpdateInvoice(id, invoiceDto);
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
}