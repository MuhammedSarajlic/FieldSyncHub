using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class AccountingConnection
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string Status { get; set; } = "NotConnected";
    public string? ExternalAccountId { get; set; }
    public string? ExternalTenantId { get; set; }
    public string? AccessTokenEncrypted { get; set; }
    public string? RefreshTokenEncrypted { get; set; }
    public DateTime? TokenExpiresAt { get; set; }
    public DateTime? LastSyncedAt { get; set; }
    public string? LastSyncSummary { get; set; }
    public string? LastError { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
