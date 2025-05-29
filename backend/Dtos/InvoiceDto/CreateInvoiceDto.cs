using backend.Dtos.LineItemDto;

namespace backend.Dtos.InvoiceDto;

public class CreateInvoiceDto
{
    public Guid CustomerId { get; set; }
    public Guid? JobId { get; set; }
    public Guid WorkspaceId { get; set; }
    public List<CreateLineItemDto> Items { get; set; }
    public decimal TaxRate { get; set; }
    public decimal Discount { get; set; }
    public string DiscountType { get; set; }
    public DateTime IssueDate { get; set; }
    public string PaymentTerms { get; set; }
    public DateTime? CustomDueDate { get; set; } 
    public string Notes { get; set; }
    public string InternalNotes { get; set; }
}