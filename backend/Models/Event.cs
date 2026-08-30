using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Event
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public Guid WorkspaceId { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "event";
    public string? Location { get; set; }
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public ICollection<Employee> AssignedTo { get; set; } = [];
    [Required]
    public DateTime StartDateTime { get; set; }
    [Required]
    public DateTime EndDateTime { get; set; }
    public bool IsAllDay { get; set; } = false;
    public bool IsRecurring { get; set; } = false;
    public Guid? RecurrenceRuleId { get; set; }
    public RecurrenceRule? RecurrenceRule { get; set; }
    [Required]
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
