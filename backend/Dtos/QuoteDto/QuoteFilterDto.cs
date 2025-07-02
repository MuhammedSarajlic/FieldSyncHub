namespace backend.Dtos.QuoteDto;

public class QuoteFilterDto
{
    public string? Q { get; set; }
    public string? SortBy { get; set; }
    public string? Sort { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedDateMin { get; set; }
    public DateTime? CreatedDateMax { get; set; }

    public decimal? TotalMin { get; set; }
    public decimal? TotalMax { get; set; }
}