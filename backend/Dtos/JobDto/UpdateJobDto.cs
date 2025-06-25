using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.JobDto;

public class UpdateJobDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? PropertyId { get; set; }
    public JobType? JobType { get; set; }
    public string? Repeats { get; set; }
    public ICollection<UpdateLineItemDto>? LineItems { get; set; }
    public JobPriority? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? ArrivalWindowStart { get; set; }
    public DateTime? ArrivalWindowEnd { get; set; }
    public int? Duration { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public List<Employee>? AssignedTeamMembers { get; set; }
    public decimal? DepositAmount { get; set; }
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public decimal? TaxRate { get; set; }
    public bool? SendInvoice { get; set; }
    public bool? SendReminder { get; set; }
    public int? ReminderDaysBefore { get; set; }
    public bool? ConfirmationSent { get; set; }
    public bool? ReminderSent { get; set; }
    public bool? InvoiceSent { get; set; }
    public string? Source { get; set; }
    public List<string>? Tags { get; set; }
    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }
}