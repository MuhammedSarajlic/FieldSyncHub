using backend.Dtos.CustomerPhoneDto;
using backend.Dtos.CustomFieldValueDto;
using backend.Dtos.PropertyDto;

namespace backend.Dtos.CustomerDto;

public class UpdateCustomerDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string DisplayName { get; set; } = string.Empty;

    public List<string> Emails { get; set; } = [];

    public bool IsReceiveJobNotifications { get; set; }
    public bool IsReceiveQuoteNotifications { get; set; }
    public bool IsReceiveInvoiceNotifications { get; set; }

    public string? BillingStreet { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingState { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }

    public ICollection<UpdateCustomFieldValueDto>? CustomFieldValues { get; set; }
    public ICollection<UpdatePropertyDto>? Properties { get; set; }
    public ICollection<UpdateCustomerPhoneDto>? CustomerPhones { get; set; }
}