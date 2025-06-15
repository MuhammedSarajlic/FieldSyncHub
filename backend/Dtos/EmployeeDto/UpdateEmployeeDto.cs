namespace backend.Dtos.EmployeeDto;

public class UpdateEmployeeDto : CreateEmployeeDto
{
    public Guid Id { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}