using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Dtos.Response;

public sealed class PropertyResponseDto
{
    public Guid Id { get; init; }
    public string? Street { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? Country { get; init; }
    public string? PostalCode { get; init; }
    public string Address { get; init; } = string.Empty;
    public decimal? Latitude { get; init; }
    public decimal? Longitude { get; init; }
    public bool IsBillingAddress { get; init; }
    public Guid CustomerId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CustomerPhoneResponseDto
{
    public Guid Id { get; init; }
    public PhoneType PhoneType { get; init; }
    public string PhoneNumber { get; init; } = string.Empty;
    public bool IsReceiveMessage { get; init; }
    public Guid CustomerId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class NoteResponseDto
{
    public Guid Id { get; init; }
    public Guid? WorkspaceId { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public string CreatedByName { get; init; } = string.Empty;
    public string? NoteText { get; init; }
    public string? PathFile { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CustomFieldResponseDto
{
    public Guid Id { get; init; }
    public Guid WorkspaceId { get; init; }
    public string FieldName { get; init; } = string.Empty;
    public CustomFieldType FieldType { get; init; }
    public string? DefaultValue { get; init; }
    public List<string>? DropdownOptions { get; init; }
    public bool IsRequired { get; init; }
    public bool IsArchived { get; init; }
}

public sealed class CustomFieldValueResponseDto
{
    public Guid Id { get; init; }
    public Guid CustomerId { get; init; }
    public Guid CustomFieldId { get; init; }
    public string? Value { get; init; }
    public CustomFieldResponseDto? CustomField { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CustomerResponseDto
{
    public Guid Id { get; init; }
    public Guid WorkspaceId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public bool IsCompany { get; init; }
    public List<string> Emails { get; init; } = [];
    public bool IsReceiveJobNotifications { get; init; }
    public bool IsReceiveQuoteNotifications { get; init; }
    public bool IsReceiveInvoiceNotifications { get; init; }
    public string? BillingStreet { get; init; }
    public string? BillingCity { get; init; }
    public string? BillingState { get; init; }
    public string? BillingCountry { get; init; }
    public string? BillingPostalCode { get; init; }
    public string BillingAddress { get; init; } = string.Empty;
    public bool IsArchived { get; init; }
    public List<string> Tags { get; init; } = [];
    public List<CustomFieldValueResponseDto> CustomFieldValues { get; init; } = [];
    public List<NoteResponseDto> Notes { get; init; } = [];
    public List<PropertyResponseDto> Properties { get; init; } = [];
    public List<CustomerPhoneResponseDto> CustomerPhones { get; init; } = [];
    public DateTime LastActivity { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class CustomerDetailsResponseDto
{
    public CustomerResponseDto Item { get; init; } = new();
    public decimal TotalInvoiceValue { get; init; }
    public CustomerCountsResponseDto Counts { get; init; } = new();
}

public sealed class CustomerCountsResponseDto
{
    public int Jobs { get; init; }
    public int Leads { get; init; }
    public int Quotes { get; init; }
    public int Invoices { get; init; }
}

public sealed class LineItemResponseDto
{
    public Guid Id { get; init; }
    public Guid? ServiceItemId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal Cost { get; init; }
    public bool IsOptional { get; init; }
    public bool IsTaxable { get; init; }
    public decimal Quantity { get; init; }
    public decimal Total { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class UserSummaryResponseDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public Guid? WorkspaceId { get; init; }
    public UserRole? Role { get; init; }
}

public sealed class EmployeeResponseDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public UserSummaryResponseDto? User { get; init; }
    public Guid WorkspaceId { get; init; }
    public string? Position { get; init; }
    public string? Department { get; init; }
    public EmployeeStatus Status { get; init; }
    public DateTime HireDate { get; init; }
    public string? PhoneNumber { get; init; }
    public string? ImageUrl { get; init; }
    public string? Location { get; init; }
    public bool IsAvailable { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class PaymentResponseDto
{
    public Guid Id { get; init; }
    public Guid? InvoiceId { get; init; }
    public Guid? JobId { get; init; }
    public decimal Amount { get; init; }
    public PaymentMethod Method { get; init; }
    public PaymentRecordStatus Status { get; init; }
    public string? ProcessorReference { get; init; }
    public DateTime? PaidAt { get; init; }
    public Guid? RecordedByUserId { get; init; }
    public string? Note { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class StatusChangeResponseDto
{
    public Guid Id { get; init; }
    public string FromStatus { get; init; } = string.Empty;
    public string ToStatus { get; init; } = string.Empty;
    public DateTime ChangedAt { get; init; }
    public Guid ChangedBy { get; init; }
    public string? Notes { get; init; }
    public Guid JobId { get; init; }
}

public sealed class RecurrenceRuleResponseDto
{
    public Guid Id { get; init; }
    public RecurrenceFrequency Frequency { get; init; }
    public int Interval { get; init; }
    public List<DayOfWeek> DaysOfWeek { get; init; } = [];
    public int? DayOfMonth { get; init; }
    public int? WeekOfMonth { get; init; }
    public DayOfWeek? DayOfWeekInMonth { get; init; }
    public int? MonthOfYear { get; init; }
    public RecurrenceEndType EndType { get; init; }
    public int? OccurrenceCount { get; init; }
    public DateTime? EndDate { get; init; }
}

public sealed class JobResponseDto
{
    public Guid Id { get; init; }
    public Guid WorkspaceId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid CustomerId { get; init; }
    public CustomerResponseDto? Customer { get; init; }
    public Guid? PropertyId { get; init; }
    public PropertyResponseDto? Property { get; init; }
    public JobType JobType { get; init; }
    public List<LineItemResponseDto> LineItems { get; init; } = [];
    public JobStatus Status { get; init; }
    public List<StatusChangeResponseDto> StatusHistory { get; init; } = [];
    public JobPriority Priority { get; init; }
    public DateTime StartDateTime { get; init; }
    public DateTime EndDateTime { get; init; }
    public Guid? RecurrenceRuleId { get; init; }
    public RecurrenceRuleResponseDto? RecurrenceRule { get; init; }
    public int? ArrivalWindow { get; init; }
    public int EstimatedDurationMinutes { get; init; }
    public List<EmployeeResponseDto> AssignedTeamMembers { get; init; } = [];
    public PaymentStatus PaymentStatus { get; init; }
    public decimal DepositAmount { get; init; }
    public List<PaymentResponseDto> Payments { get; init; } = [];
    public decimal DepositPaid { get; init; }
    public decimal DepositBalanceDue { get; init; }
    public bool IsDepositPaid { get; init; }
    public DiscountType DiscountType { get; init; }
    public decimal DiscountValue { get; init; }
    public decimal TaxRate { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal Subtotal { get; init; }
    public decimal TotalAmount { get; init; }
    public bool SendInvoice { get; init; }
    public bool SendReminder { get; init; }
    public int ReminderDaysBefore { get; init; }
    public bool ConfirmationSent { get; init; }
    public bool ReminderSent { get; init; }
    public bool InvoiceSent { get; init; }
    public string JobNumber { get; init; } = string.Empty;
    public DateTime? CompletedAt { get; init; }
    public string? CompletionNote { get; init; }
    public string? CustomerSignaturePath { get; init; }
    public List<string> CompletionPhotoPaths { get; init; } = [];
    public string CreatedBy { get; init; } = string.Empty;
    public string? Source { get; init; }
    public List<string> Tags { get; init; } = [];
    public string? CustomerNotes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class InvoiceResponseDto
{
    public Guid Id { get; init; }
    public Guid WorkspaceId { get; init; }
    public Guid CustomerId { get; init; }
    public CustomerResponseDto? Customer { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public Guid PropertyId { get; init; }
    public PropertyResponseDto? Property { get; init; }
    public Guid? JobId { get; init; }
    public JobSummaryResponseDto? Job { get; init; }
    public string Title { get; init; } = string.Empty;
    public List<LineItemResponseDto> LineItems { get; init; } = [];
    public List<PaymentResponseDto> Payments { get; init; } = [];
    public decimal TaxRate { get; init; }
    public decimal Discount { get; init; }
    public DiscountType DiscountType { get; init; }
    public decimal Subtotal { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal Total { get; init; }
    public decimal AmountPaid { get; init; }
    public decimal BalanceDue { get; init; }
    public InvoiceStatus Status { get; init; }
    public bool IsPaid { get; init; }
    public DateTime? SentAt { get; init; }
    public DateTime IssueDate { get; init; }
    public DateTime DueDate { get; init; }
    public string PaymentTerms { get; init; } = string.Empty;
    public string Notes { get; init; } = string.Empty;
    public string InternalNotes { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class JobSummaryResponseDto
{
    public Guid Id { get; init; }
    public string JobNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public JobStatus Status { get; init; }
}

public sealed class QuoteResponseDto
{
    public Guid Id { get; init; }
    public Guid WorkspaceId { get; init; }
    public Guid? JobId { get; init; }
    public Guid CustomerId { get; init; }
    public CustomerResponseDto? Customer { get; init; }
    public Guid CreatedByUserId { get; init; }
    public UserSummaryResponseDto? CreatedByUser { get; init; }
    public Guid? AssignedToUserId { get; init; }
    public UserSummaryResponseDto? AssignedToUser { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid? PropertyId { get; init; }
    public PropertyResponseDto? Property { get; init; }
    public string QuoteNumber { get; init; } = string.Empty;
    public QuoteStatus Status { get; init; }
    public DateTime? SentAt { get; init; }
    public bool Viewed { get; init; }
    public DateTime? ViewedAt { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public string PaymentTerms { get; init; } = string.Empty;
    public decimal DepositAmount { get; init; }
    public List<LineItemResponseDto> LineItems { get; init; } = [];
    public DiscountType DiscountType { get; init; }
    public decimal DiscountValue { get; init; }
    public decimal TaxRate { get; init; }
    public decimal Subtotal { get; init; }
    public decimal Discount { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal Total { get; init; }
    public List<NoteResponseDto> CustomerNotes { get; init; } = [];
    public List<NoteResponseDto> InternalNotes { get; init; } = [];
    public List<string> CustomerMessages { get; init; } = [];
    public List<ActivityHistoryResponseDto> ActivityHistory { get; init; } = [];
    public string Source { get; init; } = string.Empty;
    public List<QuoteAttachmentResponseDto> Attachments { get; init; } = [];
    public bool IsArchived { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class ActivityHistoryResponseDto
{
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public Guid EntityId { get; init; }
    public Guid? WorkspaceId { get; init; }
    public DateTime ChangedAt { get; init; }
    public Guid ChangedBy { get; init; }
    public string ChangedByName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class QuoteAttachmentResponseDto
{
    public Guid Id { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string? Url { get; init; }
    public Guid QuoteId { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class LeadResponseDto
{
    public Guid Id { get; init; }
    public Guid? CustomerId { get; init; }
    public CustomerResponseDto? Customer { get; init; }
    public Guid? QuoteId { get; init; }
    public Guid? ConvertedToJobId { get; init; }
    public Guid WorkspaceId { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
    public string? Source { get; init; }
    public string Description { get; init; } = string.Empty;
    public DateTime? StartDateTime { get; init; }
    public DateTime? EndDateTime { get; init; }
    public LeadStatus Status { get; init; }
    public LeadPriority Priority { get; init; }
    public List<LineItemResponseDto> LineItems { get; init; } = [];
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
