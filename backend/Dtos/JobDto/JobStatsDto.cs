namespace backend.Dtos.JobDto;

public class JobStatsDto
{
    public int TotalJobs { get; set; }
    public int CompletedJobs { get; set; }
    public int ScheduledJobs { get; set; }
    public decimal TotalValue { get; set; }
}