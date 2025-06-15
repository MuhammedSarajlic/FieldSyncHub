using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using backend.Models.QuoteModels;
using backend.Models.RequestModels;

namespace backend.Models;

public class LineItem
{
    [Key]
    public Guid Id { get; set; }
    public Guid? ServiceItemId { get; set; }
    public ServiceItem? ServiceItem { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }
    [Range(0, double.MaxValue)]
    public decimal Cost { get; set; }
    public decimal TaxRate { get; set; }
    public bool IsTaxable { get; set; }
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;
    [NotMapped]
    public decimal Subtotal => UnitPrice * Quantity;
    [NotMapped]
    public decimal TaxAmount => IsTaxable ? Math.Round(Subtotal * TaxRate, 2) : 0m;
    [NotMapped]
    public decimal TotalPrice => Subtotal + TaxAmount;

    public Guid? JobId { get; set; }
    [JsonIgnore]
    public Job? Job { get; set; }
    public Guid? InvoiceId { get; set; }
    [JsonIgnore]
    public Invoice? Invoice { get; set; }
    public Guid? QuoteId { get; set; }
    [JsonIgnore]
    public Quote? Quote { get; set; }
    public Guid? RequestId { get; set; }
    [JsonIgnore]
    public Request? Request { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}