

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
}