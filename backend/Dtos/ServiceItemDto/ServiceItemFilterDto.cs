namespace backend.Dtos.ServiceItemDto;

public class ServiceItemFilterDto
{
    public string? Q { get; set; } // General search query (e.g., name, SKU)
    public string? SortBy { get; set; }
    public string? Sort { get; set; }

    public string? Category { get; set; }

    // Changed to string? because you pass 'service' or 'material' as strings
    public string? Type { get; set; }

    public decimal? PriceMin { get; set; }
    public decimal? PriceMax { get; set; }

    // Changed to string? because you pass 'true'/'false' as strings
    public string? IsActive { get; set; }
    // Changed to string? because you pass 'true'/'false' as strings
    public string? HasImage { get; set; }
    public string? Description { get; set; } // Maps to 'description' filter on frontend
}


