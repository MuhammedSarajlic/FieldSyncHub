using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Event
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid WorkspaceId { get; set; } // To scope events per workspace

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    // IDs of assigned users
    public List<Guid> AssignedToIds { get; set; } = [];

    // Optional full user entities for eager loading
    public List<User>? AssignedTo { get; set; }

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    public bool IsRecurring { get; set; } = false;

    // Optional recurrence rule
    public Guid? RecurrenceRuleId { get; set; }
    public RecurrenceRule? RecurrenceRule { get; set; }

    [Required]
    public Guid CreatedBy { get; set; } // User ID

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
