namespace backend.Dtos.EmployeeDto;

public class EmployeeStatsDto
{
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int AvailableEmployees { get; set; }
    public int NewHiresThisMonth { get; set; }
}