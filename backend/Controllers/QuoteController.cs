using System.Security.Claims;
using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/quote")]
public class QuoteController : ControllerBase
{
    private readonly IQuoteService _quoteService;
    private readonly QuotePdfService _quotePdfService;

    public QuoteController(IQuoteService quoteService, QuotePdfService quotePdfService)
    {
        _quoteService = quoteService;
        _quotePdfService = quotePdfService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Quote>>> GetAllQuotes()
    {
        return Ok(await _quoteService.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Quote>> GetQuoteById(Guid id)
    {
        var result = await _quoteService.GetByIdAsync(id);
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
        var result = await _quoteService.GetQuotesByCustomerId(customerId);
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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var userName = User.Identity?.Name ?? "System";

        var attachment = await _quoteService.AddAttachmentToQuote(quoteId, attachmentDto, userId, userName);
        return Ok(attachment);
    }


    [HttpPut]
    public async Task<ActionResult<Quote>> UpdateQuote(UpdateQuoteDto updatedQuoteDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var userName = User.Identity?.Name ?? "System";

        var result = await _quoteService.UpdateQuote(updatedQuoteDto, userId, userName);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuote(Guid id)
    {
        var success = await _quoteService.DeleteQuote(id);
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

    [HttpGet("quote/{id}/pdf")]
    public async Task<IActionResult> GetQuotePdf(Guid id)
    {
        var quoteData = new QuoteData
        {
            QuoteNumber = "0001001",
            QuoteDate = DateTime.Now,
            DueDate = DateTime.Now.AddDays(14),
            Currency = "EUR",
            Company = new CompanyInfo
            {
                Name = "Your Company Inc.",
                Address = "Zmaja od Bosne 14,\nZenica 72000, BiH",
                Phone = "+387 62409924",
                Email = "office@inatdigital.com",
                Website = "www.yourcompany.com"
            },
            Customer = new CustomerInfo
            {
                Name = "Customer Name",
                Address = "Hamida 25,\nZenica 72000, BiH",
                Phone = "+387 123 456 789",
                Email = "customer@email.com"
            },
            LineItems = new List<QuoteLineItem>
            {
                new QuoteLineItem
                {
                    Quantity = 1.00m,
                    Description = "This is the best description for line item",
                    UnitPrice = 325.00m,
                    HasTax1 = true,
                    HasTax2 = false
                },
                new QuoteLineItem
                {
                    Quantity = 2.00m,
                    Description = "Second best line item",
                    UnitPrice = 150.00m,
                    HasTax1 = false,
                    HasTax2 = true
                },
                new QuoteLineItem
                {
                    Quantity = 1.00m,
                    Description = "And third best line items is",
                    UnitPrice = 100.00m,
                    HasTax1 = false,
                    HasTax2 = false
                }
            },
            Subtotal = 725.00m,
            DiscountPercentage = 5.00m,
            DiscountAmount = 36.25m,
            Tax1Amount = 15.44m,
            Tax2Amount = 23.51m,
            Total = 727.70m,
            Notes = "Best project we must finish before yesterday",
            ShowCompanySignature = true,
            ShowCustomerSignature = true
        };

        try
        {
            var pdfBytes = _quotePdfService.GenerateQuotePdf(quoteData);

            return File(pdfBytes, "application/pdf", $"Quote_{quoteData.QuoteNumber}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating PDF: {ex.Message}");
        }
        // var quote = await _quoteService.GetByIdAsync(id);
        // var pdfBytes = _quoteService.GenerateQuotePdf(quote);
        // return File(pdfBytes, "application/pdf", $"Quote_{quote.Id}.pdf");
    }


}