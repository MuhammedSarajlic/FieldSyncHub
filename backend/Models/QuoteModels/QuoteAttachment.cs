using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models.QuoteModels;

public class QuoteAttachment
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public string FileName { get; set; } = string.Empty;
    public string? Url { get; set; }
    public Guid QuoteId { get; set; }
    [JsonIgnore]
    public Quote? Quote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}