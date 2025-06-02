using backend.Dtos.QuoteDto;
using backend.Models.Quote;
using backend.Response;

namespace backend.Services.QuoteService;

public interface IQuoteService
{
    Task<List<Quote>> GetAllAsync();
    Task<Quote> GetByIdAsync(Guid id);
    Task<List<Quote>> GetQuotesByWorkspaceId(Guid workspaceId);
    Task<Quote> CreateAsync(CreateQuoteDto dto);
    Task<Quote> UpdateAsync(Guid id, CreateQuoteDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<ApiResponse<List<Quote>>> GetQuotesByFilter(
        string? q,
        Guid? workspaceId,
        string? status,
        DateTime? createdMin,
        DateTime? createdMax,
        decimal? totalMin,
        decimal? totalMax,
        string? sortBy,
        string? sort
    );
}