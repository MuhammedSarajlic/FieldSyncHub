using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class CustomerPhone
{
    [Key]
    public Guid Id { get; set; }
    public PhoneType PhoneType { get; set; } = PhoneType.Work;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsReceiveMessage { get; set; }
    public Guid CustomerId { get; set; }
    [JsonIgnore]
    public Customer? Customer { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum PhoneType
{
    Work,
    Mobile,
    Home,
    Other
}