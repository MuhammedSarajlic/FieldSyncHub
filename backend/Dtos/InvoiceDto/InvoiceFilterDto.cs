namespace backend.Dtos.InvoiceDto;

public class InvoiceFilterDto
{
    public string? Q { get; set; }
    public string? SortBy { get; set; }
    public string? Sort { get; set; }
    public string? Status { get; set; }
    public DateTime? DueDateMin { get; set; }
    public DateTime? DueDateMax { get; set; }
    public decimal? TotalMin { get; set; }
    public decimal? TotalMax { get; set; }
}