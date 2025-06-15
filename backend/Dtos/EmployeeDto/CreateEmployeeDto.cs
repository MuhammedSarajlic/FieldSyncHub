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
}
