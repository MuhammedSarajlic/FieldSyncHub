using System.ComponentModel.DataAnnotations;
using backend.Models.QuoteModels;

namespace backend.Models.RequestModels;

public class Request
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
    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
    [Required]
    public string Description { get; set; } = string.Empty;
    public DateTime? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public RequestPriority Priority { get; set; } = RequestPriority.Normal;
    public List<LineItem> LineItems { get; set; } = [];
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


public enum RequestStatus
{
    Pending,
    Reviewed,
    Approved,
    Declined,
    Converted
}

public enum RequestPriority
{
    Low,
    Normal,
    High,
    Urgent
}