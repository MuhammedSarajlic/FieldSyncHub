using System.ComponentModel.DataAnnotations;

namespace backend.Models.QuoteModels;

public class QuoteAttachment
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public string FileName { get; set; } = string.Empty;
    public string? Url { get; set; }
    public Guid QuoteId { get; set; }
    public Quote? Quote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}