using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Models;

public class Customers
{
    [Key]
    public Guid CustomerId { get; set; }
    [Required]
    public string? FirstName { get; set; }
    [Required]
    public string? LastName { get; set; }
    public string? CompanyName { get; set; }
    public bool IsCompany { get; set; }
    public List<string>? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public int PostalCode { get; set; }
    public string? BillingStreet { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingProvince { get; set; }
    public string? BillingPostalCode { get; set; }
    public string? BillingCountry { get; set; }
    public bool TextMessagesEnabled { get; set; }
    public bool VisitReminders { get; set; }
    public bool JobFollowUps { get; set; }
    public bool QuoteFollowUps { get; set; }
    public bool InvoiceFollowUps { get; set; }
    public bool Archived { get; set; }
    public string? Note { get; set; }
    public string? Tags { get; set; }
    public ICollection<CustomFields>? CustomFields {get; set;}
    public ICollection<Notes>? Notes { get; set; }
    public ICollection<Property>? Properties { get; set; }
    public ICollection<CustomerPhone>? CustomerPhones { get; set; }

}