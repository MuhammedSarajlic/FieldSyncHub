using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;

namespace backend.Services.InvoiceService;

public interface IInvoiceService
{
    Task<List<Invoice>> GetAllInvoices();
    Task<Invoice> GetInvoiceById(Guid id);
    Task<Invoice> GetInvoiceByInvoiceNumber(Guid workspaceId, string invoiceNumber);
    Task<List<Invoice>> GetInvoicesByWorkspaceId(Guid workspaceId);
    Task<ApiResponse<List<Invoice>>> GetInvoicesByFilter(InvoiceFilterDto filterDto, Guid workspaceId);
    Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId);
    Task<Invoice> CreateInvoice(CreateInvoiceDto createInvoiceDto);
    Task<Invoice> UpdateInvoice(UpdateInvoiceDto updatedInvoiceDto);
    Task DeleteInvoice(Guid id);
    byte[] GenerateDocument(Invoice invoice);
}