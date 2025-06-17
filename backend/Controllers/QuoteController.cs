using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.QuoteService;
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

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<List<Quote>>> GetQuotesByWorkspaceId(Guid workspaceId)
    {
        var result = await _quoteService.GetQuotesByWorkspaceId(workspaceId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<List<Quote>>> GetQuotesByCustomerId(Guid customerId)
    {
        var result = await _quoteService.GetQuotesByCustomerId(customerId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("workspace/{workspaceId}/filter")]
    public async Task<ActionResult<ApiResponse<List<Quote>>>> GetByFilter(Guid workspaceId, [FromQuery] QuoteFilterDto filterDto)
    {
        var result = await _quoteService.GetQuotesByFilter(workspaceId, filterDto);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Quote>> CreateQuote(CreateQuoteDto createQuoteDto)
    {
        var result = await _quoteService.CreateAsync(createQuoteDto);
        return Ok(result);
    }


    [HttpPut]
    public async Task<ActionResult<Quote>> UpdateQuote(UpdateQuoteDto updatedQuoteDto)
    {
        var result = await _quoteService.UpdateAsync(updatedQuoteDto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuote(Guid id)
    {
        var success = await _quoteService.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}