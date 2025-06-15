using System.ComponentModel.DataAnnotations;
using backend.Dtos.CustomerPhoneDto;
using backend.Dtos.CustomFieldValueDto;
using backend.Dtos.PropertyDto;

namespace backend.Dtos.CustomerDto;

public class CreateCustomerDto
{
    public Guid WorkspaceId { get; set; }

    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
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

    public ICollection<CreateCustomFieldValueDto>? CustomFieldValues { get; set; }
    public ICollection<CreatePropertyDto>? Properties { get; set; }
    public ICollection<CreateCustomerPhoneDto>? CustomerPhones { get; set; }

}