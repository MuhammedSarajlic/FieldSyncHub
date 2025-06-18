using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.QuoteModels;

namespace backend.Models;

public class Job
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? PropertyId { get; set; }
    public Property? Property { get; set; }
    public JobType JobType { get; set; } = JobType.OneTime;
    public string Repeats { get; set; } = string.Empty;
    public ICollection<LineItem> LineItems { get; set; } = [];
    public JobStatus Status { get; set; } = JobStatus.Scheduled;
    public ICollection<StatusChange> StatusHistory { get; set; } = [];
    public JobPriority Priority { get; set; } = JobPriority.Normal;
    public DateTime StartDate { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? ArrivalWindowStart { get; set; }
    public DateTime? ArrivalWindowEnd { get; set; }
    public int? Duration { get; set; }
    public string TimeZone { get; set; } = "UTC";
    public int EstimatedDurationMinutes { get; set; }
    public List<Employee> AssignedTeamMembers { get; set; } = [];
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public decimal DepositAmount { get; set; }
    [NotMapped]
    public decimal Subtotal => LineItems.Sum(li => li.TotalPrice);
    public decimal TaxAmount { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountAmount { get; set; }
    [NotMapped]
    public decimal CalculatedDiscount
    {
        get
        {
            if (string.Equals(DiscountType.ToString(), "percent", StringComparison.OrdinalIgnoreCase))
                return Math.Round(Subtotal * (DiscountAmount / 100m), 2);

            return DiscountAmount;
        }
    }
    [NotMapped]
    public decimal TotalAmount => Subtotal + TaxAmount - CalculatedDiscount;
    public bool SendInvoice { get; set; }
    public bool SendReminder { get; set; }
    public int ReminderDaysBefore { get; set; } = 1;
    public bool ConfirmationSent { get; set; }
    public bool ReminderSent { get; set; }
    public bool InvoiceSent { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public DateTime? CompletedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? Source { get; set; } // "web", "phone", "email", "walk-in", etc.
    public List<string> Tags { get; set; } = [];
    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum JobStatus
{
    Scheduled,
    Dispatched,
    InProgress,
    Completed,
    Cancelled,
}

public enum JobPriority
{
    Low,
    Normal,
    High,
    Urgent,
}

public enum JobType
{
    OneTime,
    Recurring,
}

public enum PaymentStatus
{
    Unpaid,
    Partial,
    Paid,
    Refunded,
}