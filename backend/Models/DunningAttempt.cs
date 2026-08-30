using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class DunningAttempt
{
    [Key] public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid InvoiceId { get; set; }
    public int DaysOverdue { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
