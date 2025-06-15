using backend.Dtos.LineItemDto;
using backend.Models.QuoteModels;

namespace backend.Dtos.QuoteDto;

public class UpdateQuoteDto
{
    public Guid Id { get; set; }

    public DateTime? ExpiresAt { get; set; }
    public List<UpdateLineItemDto> LineItems { get; set; } = [];

    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }

    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }

    public List<QuoteAttachmentDto> Attachments { get; set; } = [];

}
