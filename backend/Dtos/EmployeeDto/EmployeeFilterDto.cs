namespace backend.Dtos.EmployeeDto;

public class EmployeeFilterDto
{
    public string? Q { get; set; }
    public string? SortBy { get; set; }
    public string? Sort { get; set; }
    public Guid? WorkspaceId { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public string? Status { get; set; }
    public DateTime? HireDateMin { get; set; }
    public DateTime? HireDateMax { get; set; }
}