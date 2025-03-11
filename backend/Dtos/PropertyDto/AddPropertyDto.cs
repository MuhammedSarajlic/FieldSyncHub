using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.PropertyDto;

public class AddPropertyDto
{
    [Key]
    public Guid Id { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public bool IsBillingAddress { get; set; }
    public Guid CustomerId { get; set; }
}