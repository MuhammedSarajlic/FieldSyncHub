using backend.Dtos.LineItemDto;
using backend.Models.QuoteModels;

namespace backend.Dtos.QuoteDto;

public class CreateQuoteDto
{
    public Guid WorkspaceId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid CreatedByUserId { get; set; }

    public QuoteStatus Status { get; set; }
    public DateTime? ExpiresAt { get; set; }

    public List<CreateLineItemDto> LineItems { get; set; } = [];

    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }

    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }

    public ICollection<QuoteAttachment> Attachments { get; set; } = [];
}