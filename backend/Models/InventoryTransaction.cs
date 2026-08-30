using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class InventoryTransaction
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid ServiceItemId { get; set; }
    public ServiceItem? ServiceItem { get; set; }
    public Guid? JobId { get; set; }
    public decimal QuantityDelta { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid? RecordedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
