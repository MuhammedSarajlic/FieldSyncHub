using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.InvoiceDto;

public class UpdateInvoiceDto
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public string? Title { get; set; }
    public List<UpdateLineItemDto>? LineItems { get; set; }
    public decimal? TaxRate { get; set; }
    public decimal? Discount { get; set; }
    public DiscountType? DiscountType { get; set; }
    public InvoiceStatus? Status { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? PaymentTerms { get; set; }
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
}
