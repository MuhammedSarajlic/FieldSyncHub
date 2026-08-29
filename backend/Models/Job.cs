using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.QuoteModels;
using backend.Services.Billing;

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
    public ICollection<LineItem> LineItems { get; set; } = [];
    public JobStatus Status { get; set; } = JobStatus.Scheduled;
    public ICollection<StatusChange> StatusHistory { get; set; } = [];
    public JobPriority Priority { get; set; } = JobPriority.Normal;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public Guid? RecurrenceRuleId { get; set; }
    public RecurrenceRule? RecurrenceRule { get; set; }
    public int? ArrivalWindow { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public List<Employee> AssignedTeamMembers { get; set; } = [];
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public decimal DepositAmount { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    public decimal DiscountValue { get; set; }
    private TotalsBreakdown Totals => TotalsCalculator.Calculate(LineItems, DiscountType, DiscountValue, TaxRate);
    [NotMapped]
    public decimal Subtotal => Totals.Subtotal;
    [NotMapped]
    public decimal Discount => Totals.Discount;
    public decimal TaxRate { get; set; }
    [NotMapped]
    public decimal TaxAmount => Totals.TaxAmount;
    [NotMapped]
    public decimal TotalAmount => Totals.Total;
    public bool SendInvoice { get; set; }
    public bool SendReminder { get; set; }
    public int ReminderDaysBefore { get; set; } = 1;
    public bool ConfirmationSent { get; set; }
    public bool ReminderSent { get; set; }
    public bool InvoiceSent { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public DateTime? CompletedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? Source { get; set; }
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
    Canceled,
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
