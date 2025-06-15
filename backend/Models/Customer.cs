using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Models;

public class Customer
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }

    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    public string LastName { get; set; } = string.Empty;

    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";
    public string? CompanyName { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    [NotMapped]
    public bool IsCompany => !string.IsNullOrWhiteSpace(CompanyName);

    public List<string> Emails { get; set; } = [];

    public bool IsReceiveJobNotifications { get; set; } = true;
    public bool IsReceiveQuoteNotifications { get; set; } = true;
    public bool IsReceiveInvoiceNotifications { get; set; } = true;

    public string? BillingStreet { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingState { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }
    [NotMapped]
    public string BillingAddress =>
        $"{BillingStreet}, {BillingCity}, {BillingState} {BillingPostalCode}";

    public bool IsArchived { get; set; }

    public List<string> Tags { get; set; } = [];
    public ICollection<CustomFieldValue>? CustomFieldValues { get; set; }
    public ICollection<Note>? Notes { get; set; }
    public ICollection<Property>? Properties { get; set; }
    public ICollection<CustomerPhone>? CustomerPhones { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}