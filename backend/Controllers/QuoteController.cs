using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.QuoteService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/quote")]
public class QuoteController : ControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuoteController(IQuoteService quoteService)
    {
        _quoteService = quoteService;
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

    [HttpPost]
    public async Task<ActionResult<Quote>> CreateQuote(CreateQuoteDto createQuoteDto)
    {
        var result = await _quoteService.CreateQuote(createQuoteDto);
        return Ok(result);
    }


    [HttpPut]
    public async Task<ActionResult<Quote>> UpdateQuote(UpdateQuoteDto updatedQuoteDto)
    {
        var result = await _quoteService.UpdateQuote(updatedQuoteDto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuote(Guid id)
    {
        var success = await _quoteService.DeleteQuote(id);
        return success ? NoContent() : NotFound();
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

}