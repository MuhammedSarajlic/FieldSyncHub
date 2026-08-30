using backend.Models;

namespace backend.Dtos.WorkspaceDto;

public class CreateWorkspaceDto
{
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
    public string? TimeZoneId { get; set; }
    public CompanySize Size { get; set; } = CompanySize.Solo;
    public Guid CreatedByUserId { get; set; }
    public string? LogoUrl { get; set; }
    public string Theme { get; set; } = "light";
    public string Category { get; set; } = string.Empty;
}
