using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class StatusChange
{
    [Key]
    public Guid Id { get; set; }
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public Guid ChangedBy { get; set; }
    public string? Notes { get; set; }
    public Guid JobId { get; set; }
    [JsonIgnore]
    public Job? Job { get; set; }
}