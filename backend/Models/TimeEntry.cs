using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class TimeEntry
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid JobId { get; set; }
    public Job? Job { get; set; }
    public Guid EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public DateTime ClockIn { get; set; }
    public DateTime? ClockOut { get; set; }
    public TimeEntryType Type { get; set; } = TimeEntryType.OnSite;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum TimeEntryType
{
    Travel,
    OnSite,
    Break
}
