using backend.Dtos.UserDto;
using backend.Models;

namespace backend.Dtos.WorkspaceDto;

public class GetWorkspaceDto
{
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
    public CompanySize Size { get; set; }
    public UserLookupDto? CreatedByUser { get; set; }
    public string? LogoUrl { get; set; }
    public string Theme { get; set; } = "light";
    public string Category { get; set; } = string.Empty;
    public bool DunningEnabled { get; set; }
    public string DunningDays { get; set; } = "7,14,30";
    public string DocumentPrimaryColor { get; set; } = "#0f5132";
    public string? DocumentFooterText { get; set; }
    public string DocumentHeaderLayout { get; set; } = "standard";
    public ICollection<UserLookupDto> Users { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
