using backend.Models;
using backend.Models.Quote;

namespace backend.Dtos.QuoteDto;

public class QuoteDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string QuoteNumber { get; set; }
    public QuoteStatus Status { get; set; }
    public bool Viewed { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid CustomerId { get; set; }
    public List<LineItem> LineItems { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Tax { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public string Notes { get; set; }
    public string InternalNotes { get; set; }
    public List<string> AttachmentUrls { get; set; }

    public static implicit operator List<object>(QuoteDto v)
    {
        throw new NotImplementedException();
    }
}