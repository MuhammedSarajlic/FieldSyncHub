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

    private decimal _subtotal;
    private decimal _discount;
    private decimal _taxAmount;
    private decimal _total;
    public decimal Subtotal { get => EffectiveTotals().Subtotal; private set => _subtotal = value; }
    public decimal Discount { get => EffectiveTotals().Discount; private set => _discount = value; }
    public decimal TaxAmount { get => EffectiveTotals().TaxAmount; private set => _taxAmount = value; }
    public decimal Total { get => EffectiveTotals().Total; private set => _total = value; }

    public List<Note> CustomerNotes { get; set; } = [];
    public List<Note> InternalNotes { get; set; } = [];

    public List<string> CustomerMessages { get; set; } = [];
    public List<ActivityHistory> ActivityHistory { get; set; } = [];

    public string Source { get; set; } = string.Empty;

    public ICollection<QuoteAttachment> Attachments { get; set; } = [];

    public bool IsArchived { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public void RecalculateTotals()
    {
        var totals = TotalsCalculator.Calculate(LineItems, DiscountType, DiscountValue, TaxRate);
        _subtotal = totals.Subtotal;
        _discount = totals.Discount;
        _taxAmount = totals.TaxAmount;
        _total = totals.Total;
    }

    private TotalsBreakdown EffectiveTotals()
        => LineItems.Count > 0
            ? TotalsCalculator.Calculate(LineItems, DiscountType, DiscountValue, TaxRate)
            : new TotalsBreakdown(_subtotal, _discount, 0m, _taxAmount, _total);
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
