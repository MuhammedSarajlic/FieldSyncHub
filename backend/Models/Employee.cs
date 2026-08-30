using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Employee
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public DateTime HireDate { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? Location { get; set; }
    public bool IsAvailable { get; set; } = true;
    [Range(0, double.MaxValue)]
    public decimal HourlyCostRate { get; set; }
    [Range(0, double.MaxValue)]
    public decimal BillableRate { get; set; }
    public List<string> Skills { get; set; } = [];
    public List<string> Certifications { get; set; } = [];
    public List<DayOfWeek> WorkingDays { get; set; } = [];
    public TimeSpan? WorkdayStart { get; set; }
    public TimeSpan? WorkdayEnd { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


public enum EmployeeStatus
{
    Active,
    OnLeave,
    Terminated
}
