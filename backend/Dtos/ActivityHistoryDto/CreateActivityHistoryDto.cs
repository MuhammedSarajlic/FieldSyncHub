namespace backend.Dtos.ActivityHistoryDto;

public class CreateActivityHistoryDto
{
    public string Type { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public Guid ChangedBy { get; set; }
    public Guid ChangedByName { get; set; }
}