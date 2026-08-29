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

    public string Title { get; set; }
    public List<LineItem> LineItems { get; set; } = [];
    public List<Payment> Payments { get; set; } = [];
    public decimal TaxRate { get; set; }
    public decimal Discount { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    private TotalsBreakdown Totals => TotalsCalculator.Calculate(LineItems, DiscountType, Discount, TaxRate);
    [NotMapped]
    public decimal Subtotal => Totals.Subtotal;
    [NotMapped]
    public decimal Total => Totals.Total;
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
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string InternalNotes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    Paid = 2,
    Overdue = 3,
    Partial = 4
}
