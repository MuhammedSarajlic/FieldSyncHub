namespace backend.Dtos.ServiceItemDto;

public class ServiceItemFilterDto
{
    public string? Q { get; set; }
    public string? SortBy { get; set; }
    public string? Sort { get; set; }

    public string? Category { get; set; }

    public decimal? PriceMin { get; set; }
    public decimal? PriceMax { get; set; }

    public bool? IsActive { get; set; }
    public bool? HasImage { get; set; }
    public string? Description { get; set; }
}


