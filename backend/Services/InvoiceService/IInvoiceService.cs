using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;

namespace backend.Services.InvoiceService;

public interface IInvoiceService
{
    Task<IEnumerable<Invoice>> GetAllInvoices();
    Task<Invoice?> GetInvoiceById(Guid id);
    Task<Invoice?> GetInvoiceByInvoiceNumber(string invoiceNumber);
    Task<IEnumerable<Invoice>> GetInvoicesByWorkspaceId(Guid workspaceId);
    Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId);
    Task<Invoice> CreateInvoice(CreateInvoiceDto invoiceDto);
    Task<Invoice?> UpdateInvoice(Guid invoiceId, UpdateInvoiceDto invoiceDto);
    Task<bool> DeleteInvoice(Guid id);
    byte[] GenerateDocument(Invoice invoice);
    Task<ApiResponse<List<Invoice>>> GetInvoicesByFilter(
    Guid? workspaceId,
    string? status,
    DateTime? dueDateMin,
    DateTime? dueDateMax,
    decimal? totalMin,
    decimal? totalMax,
    string? sortBy,
    string? sort);
}