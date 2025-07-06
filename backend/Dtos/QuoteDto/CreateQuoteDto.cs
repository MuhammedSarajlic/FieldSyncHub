using backend.Dtos.ActivityHistoryDto;
using backend.Dtos.LineItemDto;
using backend.Dtos.NotesDto;
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
    public List<CreateNoteDto> CustomerNotes { get; set; } = [];
    public List<CreateNoteDto> InternalNotes { get; set; } = [];
    public List<CreateActivityHistoryDto> ActivityHistory { get; set; } = [];
    public string? Source { get; set; }
    public ICollection<QuoteAttachment> Attachments { get; set; } = [];
}