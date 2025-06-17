namespace backend.Dtos.PropertyDto;

public class UpdatePropertyDto
{
    public Guid Id { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public bool? IsBillingAddress { get; set; }
}