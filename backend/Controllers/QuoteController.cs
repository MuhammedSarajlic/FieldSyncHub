using System.Security.Claims;
using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Dtos.Response;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/quote")]
public class QuoteController : ControllerBase
{
    private readonly IQuoteService _quoteService;
    private readonly QuotePdfService _quotePdfService;
    private readonly ICurrentUser _currentUser;
    private readonly ILogger<QuoteController> _logger;

    public QuoteController(IQuoteService quoteService, QuotePdfService quotePdfService, ICurrentUser currentUser, ILogger<QuoteController> logger)
    {
        _quoteService = quoteService;
        _quotePdfService = quotePdfService;
        _currentUser = currentUser;
        _logger = logger;
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuoteResponseDto>> GetQuoteById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var result = await _quoteService.GetByIdAsync(id, callerWorkspaceId);
        return result == null ? NotFound() : Ok(result.ToResponse());
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<QuoteResponseDto>>> GetQuotesByWorkspace(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize)
    {
        return (await _quoteService.GetQuotesByWorkspace(workspaceId, pageNumber, pageSize)).MapPage(quote => quote.ToResponse());
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<ApiResponse<List<QuoteResponseDto>>>> GetQuotesByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var result = await _quoteService.GetQuotesByCustomerId(customerId, callerWorkspaceId);
        return result == null ? NotFound() : Ok(result.MapList(quote => quote.ToResponse()));
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<QuoteResponseDto>>> GetQuotesByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] QuoteFilterDto filterDto)
    {
        return (await _quoteService.GetQuotesByFilter(workspaceId, pageNumber, pageSize, filterDto)).MapPage(quote => quote.ToResponse());
    }

    [HttpGet("workspace/{workspaceId:guid}/stats")]
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
    public async Task<ActionResult<QuoteResponseDto>> CreateQuote(CreateQuoteDto createQuoteDto)
    {
        var result = await _quoteService.CreateQuote(createQuoteDto);
        return Ok(result.ToResponse());
    }

    [HttpPost("{quoteId:guid}/customer-note")]
    public async Task<IActionResult> AddCustomerNote(Guid quoteId, [FromBody] CreateNoteDto noteDto)
    {
        var note = await _quoteService.AddCustomerNoteToQuote(quoteId, noteDto);
        return Ok(note.ToResponse());
    }

    [HttpPost("{quoteId:guid}/internal-note")]
    public async Task<IActionResult> AddInternalNote(Guid quoteId, [FromBody] CreateNoteDto noteDto)
    {
        var note = await _quoteService.AddInternalNoteToQuote(quoteId, noteDto);
        return Ok(note.ToResponse());
    }

    [HttpPost("{quoteId:guid}/attachment")]
    public async Task<IActionResult> AddAttachment(Guid quoteId, [FromBody] QuoteAttachmentDto attachmentDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out _)) return Unauthorized();
        var userName = User.Identity?.Name ?? "System";

        try
        {
            var attachment = await _quoteService.AddAttachmentToQuote(quoteId, attachmentDto, userId, userName, callerWorkspaceId);
            return Ok(attachment.ToResponse());
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    [HttpPut]
    public async Task<ActionResult<QuoteResponseDto>> UpdateQuote(UpdateQuoteDto updatedQuoteDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out _)) return Unauthorized();
        var userName = User.Identity?.Name ?? "System";

        try
        {
            try
            {
                var result = await _quoteService.UpdateQuote(updatedQuoteDto, userId, userName, callerWorkspaceId);
                return Ok(result.ToResponse());
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { message = "This quote was changed by another user. Reload it before saving." });
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

    [HttpDelete("{id:guid}")]
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

    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> ArchiveQuote(Guid id)
    {
        await _quoteService.ArchiveQuote(id);
        return Ok();
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<QuoteResponseDto>> ChangeQuoteStatus(Guid id, [FromBody] QuoteStatus status)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out _)) return Unauthorized();
        var userName = User.Identity?.Name ?? "System";

        var quote = await _quoteService.ChangeQuoteStatus(id, status, userId, userName);
        return Ok(quote.ToResponse());
    }

    [HttpPost("{id:guid}/send")]
    [EnableRateLimiting("email-relay")]
    // 10MB of attachments base64-encoded (~4/3 overhead) plus headroom for
    // subject/message/recipients - rejected by Kestrel before model binding ever
    // buffers a bigger body into memory, rather than only after decoding it.
    [RequestSizeLimit(15 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<QuoteResponseDto>>> SendQuote(Guid id, [FromBody] SendQuoteDto sendQuoteDto)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out _)) return Unauthorized();
        var userName = User.Identity?.Name ?? "System";

        var result = await _quoteService.SendQuote(id, sendQuoteDto, userId, userName, workspaceId);

        var response = result.Map(payload => payload.ToResponse());
        return result.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("{id:guid}/pdf")]
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
            // The exception's own message can carry internal detail (a raw EF/SQL
            // error, a file path, a null-reference source) that has no business
            // reaching the client - log it server-side and return a generic message.
            _logger.LogError(ex, "Failed to generate PDF for quote {QuoteId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Could not generate the quote PDF. Please try again." });
        }
    }
}
