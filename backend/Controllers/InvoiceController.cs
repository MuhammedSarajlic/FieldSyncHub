using System.Security.Claims;
using backend.Dtos.InvoiceDto;
using backend.Dtos.Response;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.InvoiceService;
using backend.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using backend.Services.WebhookService;

namespace backend.Controllers;

[ApiController]
[Route("api/invoice")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly ICurrentUser _currentUser;
    private readonly IWebhookDispatcher _webhooks;

    public InvoiceController(IInvoiceService invoiceService, ICurrentUser currentUser, IWebhookDispatcher webhooks)
    {
        _invoiceService = invoiceService;
        _currentUser = currentUser;
        _webhooks = webhooks;
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvoiceResponseDto>> GetInvoiceById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var invoice = await _invoiceService.GetInvoiceById(id, callerWorkspaceId);
        return Ok(invoice.ToResponse());
    }

    [HttpGet("invoice-number/{invoiceNumber}")]
    public async Task<ActionResult<InvoiceResponseDto>> GetByInvoiceNumber(string invoiceNumber)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        var invoice = await _invoiceService.GetInvoiceByInvoiceNumber(workspaceId, invoiceNumber);
        return Ok(invoice.ToResponse());
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<InvoiceResponseDto>>> GetInvoicesByWorkspaceId(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize)
    {
        return (await _invoiceService.GetInvoicesByWorkspaceId(workspaceId, pageNumber, pageSize)).MapPage(invoice => invoice.ToResponse());
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<InvoiceResponseDto>>> GetInvoicesByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] InvoiceFilterDto filterDto)
    {
        return (await _invoiceService.GetInvoicesByFilter(filterDto, workspaceId, pageNumber, pageSize)).MapPage(invoice => invoice.ToResponse());
    }

    [HttpGet("workspace/{workspaceId:guid}/stats")]
    public async Task<ApiResponse<InvoiceStatsDto>> GetInvoiceStats(Guid workspaceId)
    {
        var stats = await _invoiceService.GetInvoiceStats(workspaceId);
        return new ApiResponse<InvoiceStatsDto>
        {
            Success = true,
            Payload = stats
        };
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<ApiResponse<List<InvoiceResponseDto>>>> GetInvoicesByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok((await _invoiceService.GetInvoicesByCustomerId(customerId, callerWorkspaceId)).MapList(invoice => invoice.ToResponse()));
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceResponseDto>> CreateInvoice([FromBody] CreateInvoiceDto createInvoiceDto)
    {
        var createdInvoice = await _invoiceService.CreateInvoice(createInvoiceDto);
        return Ok(createdInvoice.ToResponse());
    }

    [HttpPut]
    public async Task<ActionResult<InvoiceResponseDto>> UpdateInvoice([FromBody] UpdateInvoiceDto updatedInvoiceDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            try
            {
                var updatedInvoice = await _invoiceService.UpdateInvoice(updatedInvoiceDto, callerWorkspaceId);
                return Ok(updatedInvoice.ToResponse());
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { message = "This invoice was changed by another user. Reload it before saving." });
            }
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/send")]
    [EnableRateLimiting("email-relay")]
    [RequestSizeLimit(15 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<InvoiceResponseDto>>> SendInvoice(Guid id, [FromBody] SendInvoiceDto sendInvoiceDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId || _currentUser.UserId is not Guid userId)
        {
            return Forbid();
        }

        var userName = User.Identity?.Name
            ?? User.FindFirst(ClaimTypes.Name)?.Value
            ?? "System";

        var result = await _invoiceService.SendInvoice(id, sendInvoiceDto, callerWorkspaceId, userId, userName);
        var response = result.Map(payload => payload.ToResponse());
        return result.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("{id:guid}/payments")]
    public async Task<ActionResult<InvoiceResponseDto>> RecordPayment(Guid id, [FromBody] RecordInvoicePaymentDto paymentDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId || _currentUser.UserId is not Guid recordedByUserId)
        {
            return Forbid();
        }

        try
        {
            var invoice = await _invoiceService.RecordPayment(id, paymentDto, callerWorkspaceId, recordedByUserId);
            await _webhooks.PublishAsync(callerWorkspaceId, invoice.BalanceDue <= 0 ? "invoice.paid" : "invoice.payment_recorded", new { invoiceId = id, amount = paymentDto.Amount });
            return Ok(invoice.ToResponse());
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        await _invoiceService.DeleteInvoice(id, callerWorkspaceId);
        return Ok();
    }

    [HttpGet("{id:guid}/pdf")]
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
