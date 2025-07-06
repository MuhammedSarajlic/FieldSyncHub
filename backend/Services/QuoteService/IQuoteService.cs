using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.QuoteService;

public interface IQuoteService
{
    Task<List<Quote>> GetAllAsync();
    Task<Quote> GetByIdAsync(Guid id);
    Task<ApiResponse<PagedResult<Quote>>> GetQuotesByWorkspace(Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<PagedResult<Quote>>> GetQuotesByFilter(Guid workspaceId, int pageNumber, int pageSize, QuoteFilterDto filterDto);
    Task<ApiResponse<List<Quote>>> GetQuotesByCustomerId(Guid customerId);
    Task<Quote> CreateQuote(CreateQuoteDto createQuoteDto);
    Task<Quote> UpdateQuote(UpdateQuoteDto updatedQuoteDto);
    Task<bool> DeleteQuote(Guid id);
    Task<QuoteStatsDto> GetQuoteStats(Guid workspaceId);
}