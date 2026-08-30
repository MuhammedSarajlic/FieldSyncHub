using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using backend.Services.InvoiceService;
using backend.Wrappers;

namespace backend.Tests;

/// <summary>
/// A placeholder IInvoiceService for JobService tests that don't exercise the
/// job-completion invoicing path - throws if anything actually calls it.
/// </summary>
internal sealed class NotImplementedInvoiceService : IInvoiceService
{
    public Task<Invoice> GetInvoiceById(Guid id, Guid callerWorkspaceId) => throw new NotImplementedException();
    public Task<Invoice> GetInvoiceByInvoiceNumber(Guid workspaceId, string invoiceNumber) => throw new NotImplementedException();
    public Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByWorkspaceId(Guid workspaceId, int pageNumber, int pageSize) => throw new NotImplementedException();
    public Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByFilter(InvoiceFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize) => throw new NotImplementedException();
    public Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId, Guid callerWorkspaceId) => throw new NotImplementedException();
    public Task<Invoice> CreateInvoice(CreateInvoiceDto createInvoiceDto) => throw new NotImplementedException();
    public Task<Invoice> UpdateInvoice(UpdateInvoiceDto updatedInvoiceDto, Guid callerWorkspaceId) => throw new NotImplementedException();
    public Task<ApiResponse<Invoice>> SendInvoice(Guid id, SendInvoiceDto sendInvoiceDto, Guid callerWorkspaceId, Guid userId, string userName) => throw new NotImplementedException();
    public Task<Invoice> RecordPayment(Guid invoiceId, RecordInvoicePaymentDto paymentDto, Guid callerWorkspaceId, Guid recordedByUserId) => throw new NotImplementedException();
    public Task DeleteInvoice(Guid id, Guid callerWorkspaceId) => throw new NotImplementedException();
    public byte[] GenerateDocument(Invoice invoice) => throw new NotImplementedException();
    public Task<InvoiceStatsDto> GetInvoiceStats(Guid workspaceId) => throw new NotImplementedException();
}
