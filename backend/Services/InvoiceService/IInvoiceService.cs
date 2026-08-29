using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.InvoiceService;

public interface IInvoiceService
{
    Task<Invoice> GetInvoiceById(Guid id, Guid callerWorkspaceId);
    Task<Invoice> GetInvoiceByInvoiceNumber(Guid workspaceId, string invoiceNumber);
    Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByWorkspaceId(Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByFilter(InvoiceFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId, Guid callerWorkspaceId);
    Task<Invoice> CreateInvoice(CreateInvoiceDto createInvoiceDto);
    Task<Invoice> UpdateInvoice(UpdateInvoiceDto updatedInvoiceDto, Guid callerWorkspaceId);
    Task<Invoice> RecordPayment(Guid invoiceId, RecordInvoicePaymentDto paymentDto, Guid callerWorkspaceId, Guid recordedByUserId);
    Task DeleteInvoice(Guid id, Guid callerWorkspaceId);
    byte[] GenerateDocument(Invoice invoice);
    Task<InvoiceStatsDto> GetInvoiceStats(Guid workspaceId);
}
