using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using backend.Models.QuoteModels;
using backend.Services.Billing;

namespace backend.Models;

public class Invoice
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;

    public Guid PropertyId { get; set; }
    public Property? Property { get; set; }

    public Guid? JobId { get; set; }
    public Job? Job { get; set; }

    public string Title { get; set; } = string.Empty;
    public List<LineItem> LineItems { get; set; } = [];
    public List<Payment> Payments { get; set; } = [];
    public decimal TaxRate { get; set; }
    public decimal Discount { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    private decimal _subtotal;
    private decimal _discountAmount;
    private decimal _taxAmount;
    private decimal _total;
    public decimal Subtotal { get => EffectiveTotals().Subtotal; private set => _subtotal = value; }
    public decimal DiscountAmount { get => EffectiveTotals().Discount; private set => _discountAmount = value; }
    public decimal TaxAmount { get => EffectiveTotals().TaxAmount; private set => _taxAmount = value; }
    public decimal Total { get => EffectiveTotals().Total; private set => _total = value; }
    [NotMapped]
    public decimal AmountPaid => PaymentLedgerCalculator.CalculateAmountPaid(Payments);
    [NotMapped]
    public decimal BalanceDue => PaymentLedgerCalculator.CalculateBalanceDue(Total, Payments);
    [NotMapped]
    public bool IsPaid => BalanceDue <= 0m;
    [JsonIgnore]
    [Column("Status")]
    public InvoiceStatus WorkflowStatus { get; set; } = InvoiceStatus.Draft;
    [NotMapped]
    public InvoiceStatus Status => PaymentLedgerCalculator.DeriveInvoiceStatus(WorkflowStatus, BalanceDue, AmountPaid, DueDate, DateTime.UtcNow);
    public DateTime? SentAt { get; set; }
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string InternalNotes { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public void RecalculateTotals()
    {
        var totals = TotalsCalculator.Calculate(LineItems, DiscountType, Discount, TaxRate);
        _subtotal = totals.Subtotal;
        _discountAmount = totals.Discount;
        _taxAmount = totals.TaxAmount;
        _total = totals.Total;
    }

    private TotalsBreakdown EffectiveTotals()
        => LineItems.Count > 0
            ? TotalsCalculator.Calculate(LineItems, DiscountType, Discount, TaxRate)
            : new TotalsBreakdown(_subtotal, _discountAmount, 0m, _taxAmount, _total);
}

public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    Paid = 2,
    Overdue = 3,
    Partial = 4
}
