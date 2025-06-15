namespace backend.Dtos.CustomerDto;

public class CustomerFilterDto
{
    public string? Q { get; set; }
    public string? SortBy { get; set; }
    public string? Sort { get; set; }
    public string? CustomerType { get; set; }
    public string? customerType { get; set; }
    public DateTime? CreatedDateMin { get; set; }
    public DateTime? CreatedDateMax { get; set; }
    public int? PropertiesMin { get; set; }
    public int? PropertiesMax { get; set; }
    public bool? HasEmail { get; set; }
    public bool? HasPhone { get; set; }
    public string? Tags { get; set; }
}