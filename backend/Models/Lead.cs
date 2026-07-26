using System.ComponentModel.DataAnnotations;
using backend.Models.QuoteModels;

namespace backend.Models;

public class Lead
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? QuoteId { get; set; }
    public Quote? Quote { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }
    [Required]
    public string Description { get; set; } = string.Empty;
    // public DateTime? PreferredDate { get; set; }
    // public string? PreferredTime { get; set; }
    public DateTime? StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.Pending;
    public LeadPriority Priority { get; set; } = LeadPriority.Normal;
    public List<LineItem> LineItems { get; set; } = [];
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


public enum LeadStatus
{
    Pending,
    Reviewed,
    Approved,
    Declined,
    Converted
}

public enum LeadPriority
{
    Low,
    Normal,
    High,
    Urgent
}