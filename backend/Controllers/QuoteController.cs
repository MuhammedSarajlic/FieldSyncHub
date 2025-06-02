using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.QuoteDto;
using backend.Models.Quote;
using backend.Response;
using backend.Services.QuoteService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
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

        [HttpPost]
        public async Task<ActionResult<Quote>> CreateQuote(CreateQuoteDto dto)
        {
            var result = await _quoteService.CreateAsync(dto);
            return Ok(result);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<Quote>> UpdateQuote(Guid id, CreateQuoteDto dto)
        {
            var result = await _quoteService.UpdateAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuote(Guid id)
        {
            var success = await _quoteService.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }

        [HttpGet("filter")]
        public async Task<ActionResult<ApiResponse<List<Quote>>>> GetByFilter(
            [FromQuery] string? q,
        [FromQuery] Guid? workspaceId,
        [FromQuery] string? status,
        [FromQuery] DateTime? createdMin,
        [FromQuery] DateTime? createdMax,
        [FromQuery] decimal? totalMin,
        [FromQuery] decimal? totalMax,
        [FromQuery] string? sortBy,
        [FromQuery] string? sort)
        {
            var result = await _quoteService.GetQuotesByFilter(
                q,
                workspaceId,
                status,
                createdMin,
                createdMax,
                totalMin,
                totalMax,
                sortBy,
                sort
            );

            return Ok(result);
        }
    }
}