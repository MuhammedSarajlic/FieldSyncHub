using backend.Dtos.QuoteDto;

namespace backend.Services.QuoteService;

public interface IQuoteService
{
    Task<List<QuoteDto>> GetAllAsync();
    Task<QuoteDto> GetByIdAsync(Guid id);
    Task<QuoteDto> CreateAsync(CreateQuoteDto dto);
    Task<QuoteDto> UpdateAsync(Guid id, CreateQuoteDto dto);
    Task<bool> DeleteAsync(Guid id);
}