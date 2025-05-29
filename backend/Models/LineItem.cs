using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models;

public class LineItem
{
    [Key]
    public Guid LineItemId { get; set; }

    public Guid? ServiceItemId { get; set; }
    public ServiceItem? ServiceItem { get; set; }

    public string? Name { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? Description { get; set; }

    public int Quantity { get; set; } = 1;
    public decimal TotalPrice
    {
        get
        {
            if (ServiceItem != null)
            {
                return ServiceItem.UnitPrice * Quantity;
            }
            else if (UnitPrice.HasValue)
            {
                return UnitPrice.Value * Quantity;
            }
            else
            {
                return 0;
            }
        }
    }

    // Relationships
    public Guid? JobId { get; set; }
    [JsonIgnore]
    public Job? Job { get; set; }

    public Guid? InvoiceId { get; set; }
    [JsonIgnore]
    public Invoice? Invoice { get; set; }
}