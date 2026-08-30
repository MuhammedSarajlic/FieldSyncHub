

using backend.Models;

namespace backend.Dtos.EmployeeDto;

public class UpdateEmployeeDto
{
    public Guid Id { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public EmployeeStatus? Status { get; set; }
    public DateTime? HireDate { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? Location { get; set; }
    public bool? IsAvailable { get; set; }
    public decimal? HourlyCostRate { get; set; }
    public decimal? BillableRate { get; set; }
    public List<string>? Skills { get; set; }
    public List<string>? Certifications { get; set; }
    public List<DayOfWeek>? WorkingDays { get; set; }
    public TimeSpan? WorkdayStart { get; set; }
    public TimeSpan? WorkdayEnd { get; set; }
}
