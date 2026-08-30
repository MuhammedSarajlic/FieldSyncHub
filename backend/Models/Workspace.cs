using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Workspace
{
    [Key]
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? CompanyUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal DefaultTaxRate { get; set; }
    public string DefaultPaymentTerms { get; set; } = "uponReceipt";
    public string? TaxRegistrationNumber { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string TimeZoneId { get; set; } = "UTC";
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime? PurgeAfter { get; set; }
    public CompanySize Size { get; set; } = CompanySize.Solo;
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public string? LogoUrl { get; set; }
    public string Theme { get; set; } = "light";
    public bool ReviewRequestsEnabled { get; set; }
    public string? GoogleReviewUrl { get; set; }
    public int ReviewRequestDelayHours { get; set; } = 24;
    public bool DunningEnabled { get; set; } = true;
    public string DunningDays { get; set; } = "7,14,30";
    public string DocumentPrimaryColor { get; set; } = "#0f5132";
    public string? DocumentFooterText { get; set; }
    public string DocumentHeaderLayout { get; set; } = "standard";
    public string Category { get; set; } = string.Empty;
    public ICollection<User> Users { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum CompanySize
{
    Solo,         // 0-1 employees
    Small,        // 2-5
    Medium,       // 6-10
    Large,        // 10+
}
