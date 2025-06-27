using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.InvoiceService;

public interface IInvoiceService
{
    Task<List<Invoice>> GetAllInvoices();
    Task<Invoice> GetInvoiceById(Guid id);
    Task<Invoice> GetInvoiceByInvoiceNumber(Guid workspaceId, string invoiceNumber);
    Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByWorkspaceId(Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByFilter(InvoiceFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId);
    Task<Invoice> CreateInvoice(CreateInvoiceDto createInvoiceDto);
    Task<Invoice> UpdateInvoice(UpdateInvoiceDto updatedInvoiceDto);
    Task DeleteInvoice(Guid id);
    byte[] GenerateDocument(Invoice invoice);
    Task<InvoiceStatsDto> GetInvoiceStats(Guid workspaceId);
}