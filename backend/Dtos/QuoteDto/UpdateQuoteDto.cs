using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.QuoteDto;

public class UpdateQuoteDto
{
    public Guid Id { get; set; }

    public DateTime? ExpiresAt { get; set; }
    public List<UpdateLineItemDto>? LineItems { get; set; }
    public string Title { get; set; } = string.Empty;
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public decimal? TaxRate { get; set; }

    public List<Note> CustomerNotes { get; set; } = [];
    public List<Note> InternalNotes { get; set; } = [];

    public List<QuoteAttachmentDto>? Attachments { get; set; }
    public string Source { get; set; } = string.Empty;

}
