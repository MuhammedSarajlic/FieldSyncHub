using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class CustomFieldValue
{
    [Key]
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }
    [JsonIgnore]
    public Customer? Customer { get; set; }

    public Guid CustomFieldId { get; set; }
    public CustomField? CustomField { get; set; }

    public string? Value { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}