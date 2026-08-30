using backend.Models;

namespace backend.Dtos.WorkspaceDto;

public class UpdateWorkspaceDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Currency { get; set; }
    public decimal? DefaultTaxRate { get; set; }
    public string? DefaultPaymentTerms { get; set; }
    public string? TaxRegistrationNumber { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? TimeZoneId { get; set; }
    public CompanySize? Size { get; set; }
    public string? LogoUrl { get; set; }
    public string? Theme { get; set; }
    public string? Category { get; set; }
    public bool? DunningEnabled { get; set; }
    public string? DunningDays { get; set; }
    public string? DocumentPrimaryColor { get; set; }
    public string? DocumentFooterText { get; set; }
    public string? DocumentHeaderLayout { get; set; }
}
