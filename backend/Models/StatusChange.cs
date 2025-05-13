using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class StatusChange
{
    public Guid StatusChangeId { get; set; }
    public string FromStatus { get; set; }
    public string ToStatus { get; set; }
    public DateTime ChangedAt { get; set; }
    public string ChangedBy { get; set; }
    public string? Notes { get; set; }
    public Guid JobId { get; set; }
    [NotMapped]
    public Job Job { get; set; }
}