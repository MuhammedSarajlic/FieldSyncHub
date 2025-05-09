using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Job
{
    [Key]
    public Guid JobId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }

    public Guid CustomerId { get; set; }
    public Guid? PropertyId { get; set; }
    public string? AlternateAddress { get; set; }

    // public ICollection<ServiceItem> ServiceItems { get; set; }
    // public ICollection<LineItem> CustomLineItems { get; set; }

    public string Status { get; set; } // scheduled, in_progress, completed
    // public ICollection<StatusChange> StatusHistory { get; set; }
    public string Priority { get; set; } // Low, Normal, High, Urgent

    public DateTime ScheduleDate { get; set; }
    public string ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public string? WindowStartTime { get; set; }
    public string? WindowEndTime { get; set; }

    public ICollection<string> TeamMembers { get; set; } // tech IDs

    public string PaymentStatus { get; set; } // Unpaid, Partial, Paid
    public decimal DepositAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public string? CustomerInstructions { get; set; }
    public bool ConfirmationSent { get; set; }
    public bool ReminderSent { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public string? Source { get; set; }
    public string? Tags { get; set; }
}