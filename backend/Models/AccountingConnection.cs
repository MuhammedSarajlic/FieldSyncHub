using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class AccountingConnection
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string Status { get; set; } = "NotConnected";
    public string? ExternalAccountId { get; set; }
    public DateTime? LastSyncedAt { get; set; }
    public string? LastError { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
