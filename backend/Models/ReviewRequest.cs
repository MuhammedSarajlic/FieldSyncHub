using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ReviewRequest
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid JobId { get; set; }
    public Guid CustomerId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public string Channel { get; set; } = "Email";
    public DateTime? SentAt { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public int? Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
