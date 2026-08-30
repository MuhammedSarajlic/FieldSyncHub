using backend.Models;

namespace backend.Dtos.ServiceItemDto;

public class UpdateServiceItemDto
{
    public Guid Id { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public ServiceItemType? Type { get; set; }
    public string? Category { get; set; }
    public string? SKU { get; set; }
    public string? UnitOfMeasure { get; set; }
    public decimal? StockLevel { get; set; }
    public decimal? ReorderPoint { get; set; }
    public int? DefaultDurationMinutes { get; set; }
    public decimal? MarkupPercentage { get; set; }
    public string? Vendor { get; set; }

    public decimal? UnitPrice { get; set; }
    public decimal? Cost { get; set; }
    public bool? IsTaxable { get; set; }
    public bool? IsActive { get; set; }

    public string? ImageUrl { get; set; }
}
