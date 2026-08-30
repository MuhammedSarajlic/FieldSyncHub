using System.ComponentModel.DataAnnotations;
using backend.Dtos.RecurrenceRuleDto;

namespace backend.Dtos.EventDto;

public class CreateEventDto
{
    [Required]
    public Guid WorkspaceId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string Category { get; set; } = "event";
    public string? Location { get; set; }
    public Guid? CustomerId { get; set; }

    public ICollection<Guid> AssignedToIds { get; set; } = [];

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }
    public bool IsAllDay { get; set; } = false;

    public bool IsRecurring { get; set; } = false;

    public Guid? RecurrenceRuleId { get; set; }
    public CreateRecurrenceRuleDto? RecurrenceRule { get; set; }

    [Required]
    public Guid CreatedBy { get; set; }
}
