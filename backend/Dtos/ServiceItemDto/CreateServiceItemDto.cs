using backend.Models;

namespace backend.Dtos.ServiceItemDto;

public class CreateServiceItemDto
{
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ServiceItemType Type { get; set; } = ServiceItemType.Service;
    public string Category { get; set; } = string.Empty;
    public string? SKU { get; set; }

    public decimal UnitPrice { get; set; }
    public decimal Cost { get; set; }
    public bool IsTaxable { get; set; }
    public bool IsActive { get; set; } = true;

    public string? ImageUrl { get; set; }
}