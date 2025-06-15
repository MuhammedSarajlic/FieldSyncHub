namespace backend.Dtos.JobDto;

public class JobFilterDto
{
    public string? Q { get; set; }
    public string? SortBy { get; set; }
    public string? Sort { get; set; }
    public DateTime? ScheduleDateMin { get; set; }
    public DateTime? ScheduleDateMax { get; set; }
    public decimal? TotalMin { get; set; }
    public decimal? TotalMax { get; set; }
    public string? Priority { get; set; }
    public string? Status { get; set; }
}