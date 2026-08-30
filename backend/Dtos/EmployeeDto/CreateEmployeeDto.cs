using backend.Models;

namespace backend.Dtos.EmployeeDto;

public class CreateEmployeeDto
{
    public Guid UserId { get; set; }
    public Guid WorkspaceId { get; set; }

    public string? Position { get; set; }
    public string? Department { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public DateTime HireDate { get; set; }

    public string? PhoneNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? Location { get; set; }
    public bool IsAvailable { get; set; } = true;
    public decimal HourlyCostRate { get; set; }
    public decimal BillableRate { get; set; }
    public List<string> Skills { get; set; } = [];
    public List<string> Certifications { get; set; } = [];
    public List<DayOfWeek> WorkingDays { get; set; } = [];
    public TimeSpan? WorkdayStart { get; set; }
    public TimeSpan? WorkdayEnd { get; set; }
}
