using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ApiKey
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty;
    public string Scopes { get; set; } = "read";
    public DateTime? LastUsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class WebhookSubscription
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Events { get; set; } = "job.completed,invoice.paid,quote.approved";
    public string Secret { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
