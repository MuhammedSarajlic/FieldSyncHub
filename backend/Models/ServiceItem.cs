using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ServiceItem
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ServiceItemType Type { get; set; } = ServiceItemType.Service;

    public string Category { get; set; } = string.Empty;
    public string? SKU { get; set; }
    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }
    [Range(0, double.MaxValue)]
    public decimal Cost { get; set; }
    public bool IsTaxable { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum ServiceItemType
{
    Service,
    Material
}