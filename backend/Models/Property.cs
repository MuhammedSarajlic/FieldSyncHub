using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    public bool IsBillingAddress { get; set; }
    public Guid CustomerId { get; set; }
    [NotMapped]
    public Customers? Customer { get; set; }
}