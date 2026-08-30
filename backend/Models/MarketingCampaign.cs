using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class MarketingCampaign
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Segment { get; set; } = "all";
    public DateTime? SentAt { get; set; }
    public ICollection<MarketingCampaignRecipient> Recipients { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MarketingCampaignRecipient
{
    [Key] public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public MarketingCampaign? Campaign { get; set; }
    public Guid CustomerId { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool Sent { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? ClickedAt { get; set; }
}
