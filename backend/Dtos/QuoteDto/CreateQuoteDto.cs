using backend.Models;
using backend.Models.Quote;

namespace backend.Dtos.QuoteDto;

public class CreateQuoteDto
{
    public Guid WorkspaceId { get; set; }
    public QuoteStatus Status { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid CustomerId { get; set; }
    public List<LineItem> LineItems { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Tax { get; set; }
    public string Notes { get; set; }
    public string InternalNotes { get; set; }
    public List<string> AttachmentUrls { get; set; }
}