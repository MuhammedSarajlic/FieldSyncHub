using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.QuoteModels;

public class Quote
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public string QuoteNumber { get; set; } = string.Empty;
    public QuoteStatus Status { get; set; } = QuoteStatus.Draft;
    //sentAt is the date when the quote was sent to the customer with email or text message
    public DateTime? SentAt { get; set; }
    public bool Viewed { get; set; } = false;
    public DateTime? ViewedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }

    public ICollection<LineItem> LineItems { get; set; } = [];

    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }

    [NotMapped]
    public decimal Subtotal => LineItems.Sum(li => li.TotalPrice);
    [NotMapped]
    public decimal Discount =>
        DiscountType == DiscountType.Percentage ? Subtotal * DiscountValue / 100 : DiscountValue;
    [NotMapped]
    public decimal TaxAmount => (Subtotal - Discount) * TaxRate;
    [NotMapped]
    public decimal Total => Subtotal - Discount + TaxAmount;

    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }

    public ICollection<QuoteAttachment> Attachments { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum QuoteStatus
{
    Draft,
    Sent,
    AwaitingResponse,
    AwaitingApproval,
    Approved,
    Declined,
    Expired,
    ConvertedToJob
}

public enum DiscountType
{
    Percentage,
    FixedAmount
}