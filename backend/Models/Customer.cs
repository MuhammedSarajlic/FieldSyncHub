using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
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

    [JsonIgnore]
    public ICollection<CustomerEmail> EmailRecords { get; set; } = [];

    [NotMapped]
    public List<string> Emails
    {
        get => _pendingEmails ?? EmailRecords.Select(e => e.Email).ToList();
        set => _pendingEmails = NormalizeValues(value);
    }

    [JsonIgnore]
    public ICollection<CustomerTag> TagRecords { get; set; } = [];

    [NotMapped]
    public List<string> Tags
    {
        get => _pendingTags ?? TagRecords.Select(t => t.Tag).ToList();
        set => _pendingTags = NormalizeValues(value);
    }

    [NotMapped]
    private List<string>? _pendingEmails;

    [NotMapped]
    private List<string>? _pendingTags;

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

    public ICollection<CustomFieldValue>? CustomFieldValues { get; set; }
    public ICollection<Note>? Notes { get; set; }
    public ICollection<Property>? Properties { get; set; }
    public ICollection<CustomerPhone>? CustomerPhones { get; set; }

    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public void SyncEmailRecords()
    {
        if (_pendingEmails == null) return;
        EmailRecords.Clear();
        foreach (var email in _pendingEmails)
        {
            EmailRecords.Add(new CustomerEmail
            {
                Id = Guid.NewGuid(), CustomerId = Id, Email = email,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
        }
        _pendingEmails = null;
    }

    public void SyncTagRecords()
    {
        if (_pendingTags == null) return;
        TagRecords.Clear();
        foreach (var tag in _pendingTags)
        {
            TagRecords.Add(new CustomerTag
            {
                Id = Guid.NewGuid(), CustomerId = Id, Tag = tag, CreatedAt = DateTime.UtcNow
            });
        }
        _pendingTags = null;
    }

    private static List<string> NormalizeValues(IEnumerable<string>? values)
        => (values ?? []).Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
}
