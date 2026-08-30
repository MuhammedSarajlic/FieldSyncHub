using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Subscription
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Plan { get; set; } = "Trial";
    public int SeatCount { get; set; } = 1;
    public DateTime TrialEndsAt { get; set; } = DateTime.UtcNow.AddDays(14);
    public DateTime? CurrentPeriodEndsAt { get; set; }
    public string Status { get; set; } = "Trialing";
    public string? ProviderCustomerId { get; set; }
    public string? ProviderSubscriptionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
