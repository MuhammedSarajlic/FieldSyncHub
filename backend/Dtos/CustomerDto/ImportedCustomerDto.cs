using backend.Models;

namespace backend.Dtos.CustomerDto;

public class ImportedCustomerDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public List<string> Emails { get; set; } = [];

    public bool IsReceiveJobNotifications { get; set; } = true;
    public bool IsReceiveQuoteNotifications { get; set; } = true;
    public bool IsReceiveInvoiceNotifications { get; set; } = true;

    public string? BillingStreet { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingState { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }

    public List<string> Tags { get; set; } = [];
    public ICollection<Property> Properties { get; set; } = [];
    public ICollection<CustomerPhone> CustomerPhones { get; set; } = [];
}