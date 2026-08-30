using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class CustomerTag
{
    [Key]
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    [JsonIgnore]
    public Customer? Customer { get; set; }
    public string Tag { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
