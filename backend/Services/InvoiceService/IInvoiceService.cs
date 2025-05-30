using backend.Dtos.InvoiceDto;
using backend.Models;

namespace backend.Services.InvoiceService;

public interface IInvoiceService
{
    Task<IEnumerable<Invoice>> GetAllInvoices();
    Task<Invoice?> GetInvoiceById(Guid id);
    Task<Invoice?> GetInvoiceByInvoiceNumber(string invoiceNumber);
    Task<IEnumerable<Invoice>> GetInvoicesByWorkspaceId(Guid workspaceId);
    Task<Invoice> CreateInvoice(CreateInvoiceDto invoiceDto);
    Task<Invoice?> UpdateInvoice(Guid invoiceId, UpdateInvoiceDto invoiceDto);
    Task<bool> DeleteInvoice(Guid id);
    byte[] GenerateDocument(Invoice invoice);
}