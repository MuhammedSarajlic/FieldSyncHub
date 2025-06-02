using System.ComponentModel.DataAnnotations;

namespace backend.Models.Request;

public class Request
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public Guid CustomerId { get; set; }
    public Customers? Customer { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }

    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }

    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public QuotePriority Priority { get; set; } = QuotePriority.Normal;

    public List<LineItem>? LineItems { get; set; }

    public string? Notes { get; set; }
}


public enum RequestStatus
{
    Pending,
    Reviewed,
    Approved,
    Declined,
    Converted
}

public enum QuotePriority
{
    Low,
    Normal,
    High,
    Urgent
}