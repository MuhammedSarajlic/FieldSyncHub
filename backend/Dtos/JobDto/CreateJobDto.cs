using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.JobDto;

public class CreateJobDto
{
    public Guid WorkspaceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? PropertyId { get; set; }
    public JobType JobType { get; set; } = JobType.OneTime;
    public string Repeats { get; set; } = string.Empty;
    public ICollection<CreateLineItemDto> LineItems { get; set; } = [];
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
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal TaxRate { get; set; }
    public bool SendInvoice { get; set; }
    public bool SendReminder { get; set; }
    public int ReminderDaysBefore { get; set; } = 1;
    public bool ConfirmationSent { get; set; }
    public bool ReminderSent { get; set; }
    public bool InvoiceSent { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? Source { get; set; }
    public List<string> Tags { get; set; } = [];
    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }
}