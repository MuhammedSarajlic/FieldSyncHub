using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
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
    public List<Payment> Payments { get; set; } = [];
    [NotMapped]
    public decimal DepositPaid => PaymentLedgerCalculator.CalculateAmountPaid(Payments);
    [NotMapped]
    public decimal DepositBalanceDue => Math.Max(0m, DepositAmount - DepositPaid);
    [NotMapped]
    public bool IsDepositPaid => DepositAmount > 0m && DepositPaid >= DepositAmount;
    public DiscountType DiscountType { get; set; } = DiscountType.FixedAmount;
    public decimal DiscountValue { get; set; }
    private decimal _subtotal;
    private decimal _discount;
    private decimal _taxAmount;
    private decimal _totalAmount;
    public decimal Subtotal { get => EffectiveTotals().Subtotal; private set => _subtotal = value; }
    public decimal Discount { get => EffectiveTotals().Discount; private set => _discount = value; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get => EffectiveTotals().TaxAmount; private set => _taxAmount = value; }
    public decimal TotalAmount { get => EffectiveTotals().Total; private set => _totalAmount = value; }
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
    public bool IsArchived { get; set; }
    [JsonIgnore]
    public ICollection<JobTag> TagRecords { get; set; } = [];

    [NotMapped]
    public List<string> Tags
    {
        get => _pendingTags ?? TagRecords.Select(t => t.Tag).ToList();
        set => _pendingTags = NormalizeTags(value);
    }

    [NotMapped]
    private List<string>? _pendingTags;
    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    public void RecalculateTotals()
    {
        var totals = TotalsCalculator.Calculate(LineItems, DiscountType, DiscountValue, TaxRate);
        _subtotal = totals.Subtotal;
        _discount = totals.Discount;
        _taxAmount = totals.TaxAmount;
        _totalAmount = totals.Total;
    }

    private TotalsBreakdown EffectiveTotals()
        => LineItems.Count > 0
            ? TotalsCalculator.Calculate(LineItems, DiscountType, DiscountValue, TaxRate)
            : new TotalsBreakdown(_subtotal, _discount, 0m, _taxAmount, _totalAmount);

    public void SyncTagRecords()
    {
        if (_pendingTags == null) return;
        TagRecords.Clear();
        foreach (var tag in _pendingTags)
        {
            TagRecords.Add(new JobTag
            {
                Id = Guid.NewGuid(), JobId = Id, Tag = tag, CreatedAt = DateTime.UtcNow
            });
        }
        _pendingTags = null;
    }

    private static List<string> NormalizeTags(IEnumerable<string>? values)
        => (values ?? []).Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
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
