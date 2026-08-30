using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Services.Billing;

namespace backend.Models.QuoteModels;

public class Quote
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid? JobId { get; set; }

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public Guid? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    public string Title { get; set; } = string.Empty;

    public Guid? PropertyId { get; set; }
    public Property? Property { get; set; }

    public string QuoteNumber { get; set; } = string.Empty;
    public QuoteStatus Status { get; set; } = QuoteStatus.Draft;

    public DateTime? SentAt { get; set; }
    public bool Viewed { get; set; } = false;
    public DateTime? ViewedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string PaymentTerms { get; set; } = "uponReceipt";
    public decimal DepositAmount { get; set; }

    public ICollection<LineItem> LineItems { get; set; } = [];

    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }

    private TotalsBreakdown Totals => TotalsCalculator.Calculate(LineItems, DiscountType, DiscountValue, TaxRate);

    [NotMapped]
    public decimal Subtotal => Totals.Subtotal;

    [NotMapped]
    public decimal Discount => Totals.Discount;

    [NotMapped]
    public decimal TaxAmount => Totals.TaxAmount;

    [NotMapped]
    public decimal Total => Totals.Total;

    public List<Note> CustomerNotes { get; set; } = [];
    public List<Note> InternalNotes { get; set; } = [];

    public List<string> CustomerMessages { get; set; } = [];
    public List<ActivityHistory> ActivityHistory { get; set; } = [];

    public string Source { get; set; } = string.Empty;

    public ICollection<QuoteAttachment> Attachments { get; set; } = [];

    public bool IsArchived { get; set; } = false;
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

public enum QuoteActivityType
{
    QuoteCreated,
    QuoteEdited,
    QuoteSent,
    InternalNoteAdded,
    CustomerNoteAdded,
    CustomerMessageAdded,
    AttachmentAdded,
    MarkedSent,
    MarkedAccepted,
    MarkedRejected,
    ConvertedToJob,
    StatusChanged
}
