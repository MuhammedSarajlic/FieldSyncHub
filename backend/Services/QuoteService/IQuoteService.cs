using backend.Dtos.QuoteDto;
using backend.Models.Quote;
using backend.Response;

namespace backend.Services.QuoteService;

public interface IQuoteService
{
    Task<List<QuoteDto>> GetAllAsync();
    Task<QuoteDto> GetByIdAsync(Guid id);
    Task<QuoteDto> GetByWorkspaceIdAsync(Guid workspaceId);
    Task<QuoteDto> CreateAsync(CreateQuoteDto dto);
    Task<QuoteDto> UpdateAsync(Guid id, CreateQuoteDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<ApiResponse<List<Quote>>> GetQuotesByFilter(
    Guid? workspaceId,
    string? status,
    DateTime? createdMin,
    DateTime? createdMax,
    decimal? totalMin,
    decimal? totalMax,
    string? sortBy,
    string? sort);
}