using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.QuoteDto;

public class CreateQuoteDto
{
    public Guid WorkspaceId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid CreatedByUserId { get; set; }

    public QuoteStatus Status { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid PropertyId { get; set; }
    public List<CreateLineItemDto> LineItems { get; set; } = [];
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }
    public List<Note> CustomerNotes { get; set; } = [];
    public List<Note> InternalNotes { get; set; } = [];
    public List<StatusChange> ActivityHistory { get; set; } = [];
    public string Source { get; set; } = string.Empty;
    public ICollection<QuoteAttachment> Attachments { get; set; } = [];
}