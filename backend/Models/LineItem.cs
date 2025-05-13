using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class LineItem
{
    [Key]
    public Guid LineItemId { get; set; }

    // Reference to ServiceItem instead of copying fields
    public Guid ServiceItemId { get; set; }
    public ServiceItem? ServiceItem { get; set; }

    // Job-specific fields
    public int Quantity { get; set; } = 1;
    public decimal? TotalPrice { get; set; } // Optional price override

    // Relationships
    public Guid JobId { get; set; }
    [NotMapped]
    public Job? Job { get; set; }
}