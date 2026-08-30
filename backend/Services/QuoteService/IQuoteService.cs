using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.QuoteService;

public interface IQuoteService
{
    Task<Quote> GetByIdAsync(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<PagedResult<Quote>>> GetQuotesByWorkspace(Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<PagedResult<Quote>>> GetQuotesByFilter(Guid workspaceId, int pageNumber, int pageSize, QuoteFilterDto filterDto);
    Task<ApiResponse<List<Quote>>> GetQuotesByCustomerId(Guid customerId, Guid callerWorkspaceId);
    Task<QuoteStatsDto> GetQuoteStats(Guid workspaceId);
    Task<Quote> CreateQuote(CreateQuoteDto createQuoteDto);
    Task<Note> AddCustomerNoteToQuote(Guid quoteId, CreateNoteDto noteDto);
    Task<Note> AddInternalNoteToQuote(Guid quoteId, CreateNoteDto noteDto);
    Task<QuoteAttachment> AddAttachmentToQuote(Guid quoteId, QuoteAttachmentDto attachmentDto, string userId, string userName, Guid callerWorkspaceId);
    Task<Quote> UpdateQuote(UpdateQuoteDto updatedQuoteDto, string userId, string userName, Guid callerWorkspaceId);
    Task<bool> DeleteQuote(Guid id, Guid callerWorkspaceId);
    Task ArchiveQuote(Guid id);
    Task<Quote> ChangeQuoteStatus(Guid id, QuoteStatus status, string userId, string userName);
    Task<ApiResponse<Quote>> SendQuote(Guid id, SendQuoteDto sendQuoteDto, string userId, string userName, Guid callerWorkspaceId);
}