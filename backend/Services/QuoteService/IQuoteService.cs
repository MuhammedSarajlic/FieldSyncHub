using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using backend.Response;

namespace backend.Services.QuoteService;

public interface IQuoteService
{
    Task<List<Quote>> GetAllAsync();
    Task<Quote> GetByIdAsync(Guid id);
    Task<List<Quote>> GetQuotesByWorkspaceId(Guid workspaceId);
    Task<ApiResponse<List<Quote>>> GetQuotesByCustomerId(Guid customerId);
    Task<Quote> CreateAsync(CreateQuoteDto createQuoteDto);
    Task<Quote> UpdateAsync(UpdateQuoteDto updatedQuoteDto);
    Task<bool> DeleteAsync(Guid id);
    Task<ApiResponse<List<Quote>>> GetQuotesByFilter(Guid workspaceId, QuoteFilterDto filterDto);
}