using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using backend.Models.QuoteModels;
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
    public bool IsOptional { get; set; }
    public bool IsTaxable { get; set; }
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;
    [NotMapped]
    public decimal Total => UnitPrice * Quantity;

    public Guid? JobId { get; set; }
    [JsonIgnore]
    public Job? Job { get; set; }
    public Guid? InvoiceId { get; set; }
    [JsonIgnore]
    public Invoice? Invoice { get; set; }
    public Guid? QuoteId { get; set; }
    [JsonIgnore]
    public Quote? Quote { get; set; }
    public Guid? LeadId { get; set; }
    [JsonIgnore]
    public Lead? Lead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}