namespace backend.Dtos.PropertyDto;

public class CreatePropertyDto
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool? IsBillingAddress { get; set; }
    public Guid CustomerId { get; set; }
}
