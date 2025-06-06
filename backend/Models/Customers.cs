using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Models;

public class Customers
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    [Required]
    public string? FirstName { get; set; }
    [Required]
    public string? LastName { get; set; }

    [NotMapped]
    public string? FullName => $"{FirstName} {LastName}";
    public string? CompanyName { get; set; }
    public bool IsCompany { get; set; }
    public List<string>? Email { get; set; }
    public bool VisitReminders { get; set; }
    public bool JobFollowUps { get; set; }
    public bool QuoteFollowUps { get; set; }
    public bool InvoiceFollowUps { get; set; }
    public bool Archived { get; set; }
    public List<string>? Tags { get; set; }
    public ICollection<CustomFields>? CustomFields { get; set; }
    public ICollection<Notes>? Notes { get; set; }
    public ICollection<Property>? Properties { get; set; }
    public ICollection<CustomerPhone>? CustomerPhones { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}