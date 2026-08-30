using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class AccountingExternalRecord
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
}
