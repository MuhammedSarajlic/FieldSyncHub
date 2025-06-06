using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Property
{
    [Key]
    public Guid Id { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    [NotMapped]
    public string Address => $"{Street}, {City}, {State} {PostalCode}";
    public bool IsBillingAddress { get; set; }
    public Guid CustomerId { get; set; }
    [JsonIgnore]
    public Customers? Customer { get; set; }
}