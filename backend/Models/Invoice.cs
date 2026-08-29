using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
    public decimal TaxRate { get; set; }
    public decimal Discount { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    private TotalsBreakdown Totals => TotalsCalculator.Calculate(LineItems, DiscountType, Discount, TaxRate);
    [NotMapped]
    public decimal Subtotal => Totals.Subtotal;
    [NotMapped]
    public decimal Total => Totals.Total;

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string InternalNotes { get; set; } = string.Empty;
    public bool IsPaid { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid,
    Overdue
}
