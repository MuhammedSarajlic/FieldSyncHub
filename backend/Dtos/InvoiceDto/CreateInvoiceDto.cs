using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.InvoiceDto;

public class CreateInvoiceDto
{
    public Guid CustomerId { get; set; }
    public Guid WorkspaceId { get; set; }

    public Guid PropertyId { get; set; }

    public Guid? JobId { get; set; }

    public string Title { get; set; }
    public List<CreateLineItemDto> LineItems { get; set; } = [];
    public decimal TaxRate { get; set; }
    public decimal Discount { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;

    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string InternalNotes { get; set; } = string.Empty;
}
