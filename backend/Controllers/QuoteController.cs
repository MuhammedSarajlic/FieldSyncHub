using System.Security.Claims;
using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

[ApiController]
[Route("api/quote")]
public class QuoteController : ControllerBase
{
    private readonly IQuoteService _quoteService;
    private readonly QuotePdfService _quotePdfService;
    private readonly ICurrentUser _currentUser;

    public QuoteController(IQuoteService quoteService, QuotePdfService quotePdfService, ICurrentUser currentUser)
    {
        _quoteService = quoteService;
        _quotePdfService = quotePdfService;
        _currentUser = currentUser;
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Quote>> GetQuoteById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var result = await _quoteService.GetByIdAsync(id, callerWorkspaceId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<Quote>>> GetQuotesByWorkspace(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize)
    {
        return await _quoteService.GetQuotesByWorkspace(workspaceId, pageNumber, pageSize);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<Quote>>> GetQuotesByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var result = await _quoteService.GetQuotesByCustomerId(customerId, callerWorkspaceId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<Quote>>> GetQuotesByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] QuoteFilterDto filterDto)
    {
        return await _quoteService.GetQuotesByFilter(workspaceId, pageNumber, pageSize, filterDto);
    }

    [HttpGet("workspace/{workspaceId:guid}/quote-stats")]
    public async Task<ApiResponse<QuoteStatsDto>> GetQuoteStats(Guid workspaceId)
    {
        var stats = await _quoteService.GetQuoteStats(workspaceId);

        return new ApiResponse<QuoteStatsDto>
        {
            Success = true,
            Payload = stats
        };
    }

    [HttpPost]
    public async Task<ActionResult<Quote>> CreateQuote(CreateQuoteDto createQuoteDto)
    {
        var result = await _quoteService.CreateQuote(createQuoteDto);
        return Ok(result);
    }

    [HttpPost("{quoteId}/customer-note")]
    public async Task<IActionResult> AddCustomerNote(Guid quoteId, [FromBody] CreateNoteDto noteDto)
    {
        var note = await _quoteService.AddCustomerNoteToQuote(quoteId, noteDto);
        return Ok(note);
    }

    [HttpPost("{quoteId}/internal-note")]
    public async Task<IActionResult> AddInternalNote(Guid quoteId, [FromBody] CreateNoteDto noteDto)
    {
        var note = await _quoteService.AddInternalNoteToQuote(quoteId, noteDto);
        return Ok(note);
    }

    [HttpPost("{quoteId}/attachment")]
    public async Task<IActionResult> AddAttachment(Guid quoteId, [FromBody] QuoteAttachmentDto attachmentDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var userName = User.Identity?.Name ?? "System";

        try
        {
            var attachment = await _quoteService.AddAttachmentToQuote(quoteId, attachmentDto, userId, userName, callerWorkspaceId);
            return Ok(attachment);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    [HttpPut]
    public async Task<ActionResult<Quote>> UpdateQuote(UpdateQuoteDto updatedQuoteDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var userName = User.Identity?.Name ?? "System";

        var result = await _quoteService.UpdateQuote(updatedQuoteDto, userId, userName, callerWorkspaceId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> DeleteQuote(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var success = await _quoteService.DeleteQuote(id, callerWorkspaceId);
        return success ? NoContent() : NotFound();
    }

    [HttpPatch("{id}/archive")]
    public async Task<IActionResult> ArchiveQuote(Guid id)
    {
        await _quoteService.ArchiveQuote(id);
        return Ok();
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<Quote>> ChangeQuoteStatus(Guid id, [FromBody] QuoteStatus status)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var userName = User.Identity?.Name ?? "System";

        var quote = await _quoteService.ChangeQuoteStatus(id, status, userId, userName);
        return Ok(quote);
    }

    [HttpPost("{id:guid}/send")]
    [EnableRateLimiting("email-relay")]
    // 10MB of attachments base64-encoded (~4/3 overhead) plus headroom for
    // subject/message/recipients - rejected by Kestrel before model binding ever
    // buffers a bigger body into memory, rather than only after decoding it.
    [RequestSizeLimit(15 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<Quote>>> SendQuote(Guid id, [FromBody] SendQuoteDto sendQuoteDto)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var userName = User.Identity?.Name ?? "System";

        var result = await _quoteService.SendQuote(id, sendQuoteDto, userId, userName, workspaceId);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetQuotePdf(Guid id)
    {
        // var quote = await _quoteService.GetByIdAsync(id);

        try
        {
            var pdfBytes = await _quotePdfService.GenerateQuotePdf(id);

            return File(pdfBytes, "application/pdf", $"Quote_{id}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating PDF: {ex.Message}");
        }
    }
}