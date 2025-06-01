namespace backend.Models.Quote;

public class Quote
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string QuoteNumber { get; set; }
    public QuoteStatus Status { get; set; } = QuoteStatus.Draft;
    public bool Viewed { get; set; } = false;
    public DateTime? ViewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }

    // Reference to Customer
    public Guid CustomerId { get; set; }
    public Customers Customer { get; set; }

    // Line items
    public List<LineItem> LineItems { get; set; } = new List<LineItem>();

    // Discount and tax
    public DiscountType DiscountType { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Tax { get; set; }

    // Calculated properties
    public decimal Subtotal => CalculateSubtotal();
    public decimal Total => CalculateTotal();

    // Notes
    public string Notes { get; set; }
    public string InternalNotes { get; set; }

    public List<string> AttachmentUrls { get; set; } = new List<string>();

    private decimal CalculateSubtotal()
    {
        decimal subtotal = 0;
        foreach (var item in LineItems)
        {
            subtotal += item.Quantity * (item.UnitPrice ?? 0);
        }
        return subtotal;
    }

    private decimal CalculateTotal()
    {
        decimal discount = DiscountType == DiscountType.Percentage
            ? Subtotal * DiscountAmount / 100
            : DiscountAmount;

        decimal taxedAmount = (Subtotal - discount) * (1 + Tax);
        return taxedAmount;
    }
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