using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ActivityHistory
{
    [Key]
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public Guid ChangedBy { get; set; }
    public Guid ChangedByName { get; set; }
}