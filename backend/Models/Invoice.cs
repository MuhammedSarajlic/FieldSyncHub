using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Invoice
{
    [Key]
    public Guid InvoiceId { get; set; }
    public Guid CustomerId { get; set; }
    public Customers Customer { get; set; }
    public Guid WorkspaceId { get; set; }
    public string InvoiceNumber { get; set; } = "";

    public Guid? JobId { get; set; }
    public Job? Job { get; set; }

    public List<LineItem> Items { get; set; } = new();
    public decimal Subtotal => Items.Sum(i => (i?.ServiceItem?.UnitPrice ?? i?.UnitPrice ?? 0) * i.Quantity);
    public decimal TaxRate { get; set; }
    public decimal Discount { get; set; }
    public string DiscountType { get; set; }
    public decimal Total
    {
        get
        {
            decimal discountedSubtotal = Subtotal;
            if (DiscountType?.ToLower() == "percentage" && Discount > 0)
            {
                discountedSubtotal -= Subtotal * (Discount / 100);
            }
            else if (DiscountType?.ToLower() == "fixed" && Discount > 0)
            {
                discountedSubtotal -= Discount;
            }

            return discountedSubtotal + (discountedSubtotal * TaxRate);
        }
    }

    public string Status { get; set; } = "draft"; // draft, sent, paid, overdue
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string PaymentTerms { get; set; }
    public string Notes { get; set; }
    public string InternalNotes { get; set; }
    public bool IsPaid { get; set; } = false;
}