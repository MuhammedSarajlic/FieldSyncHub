using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Wrappers;

namespace backend.Dtos.Response;

public static class ResourceResponseMapper
{
    public static ApiResponse<TResponse> Map<TSource, TResponse>(this ApiResponse<TSource> response, Func<TSource, TResponse> map)
        => new() { Success = response.Success, ErrorMessage = response.ErrorMessage, Payload = response.Payload == null ? default : map(response.Payload) };

    public static ApiResponse<List<TResponse>> MapList<TSource, TResponse>(this ApiResponse<List<TSource>> response, Func<TSource, TResponse> map)
        => new() { Success = response.Success, ErrorMessage = response.ErrorMessage, Payload = response.Payload?.Select(map).ToList() };

    public static ApiResponse<PagedResult<TResponse>> MapPage<TSource, TResponse>(this ApiResponse<PagedResult<TSource>> response, Func<TSource, TResponse> map)
        => new()
        {
            Success = response.Success,
            ErrorMessage = response.ErrorMessage,
            Payload = response.Payload == null ? null : new PagedResult<TResponse>
            {
                Items = response.Payload.Items.Select(map).ToList(),
                TotalCount = response.Payload.TotalCount,
                PageNumber = response.Payload.PageNumber,
                PageSize = response.Payload.PageSize
            }
        };

    public static PropertyResponseDto ToResponse(this Property source) => new()
    {
        Id = source.Id, Street = source.Street, City = source.City, State = source.State,
        Country = source.Country, PostalCode = source.PostalCode, Address = source.Address,
        Latitude = source.Latitude, Longitude = source.Longitude, IsBillingAddress = source.IsBillingAddress,
        CustomerId = source.CustomerId, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static CustomerResponseDto ToResponse(this Customer source) => new()
    {
        Id = source.Id, WorkspaceId = source.WorkspaceId, FirstName = source.FirstName, LastName = source.LastName,
        FullName = source.FullName, CompanyName = source.CompanyName, DisplayName = source.DisplayName,
        IsCompany = source.IsCompany, Emails = source.Emails, Tags = source.Tags,
        IsReceiveJobNotifications = source.IsReceiveJobNotifications,
        IsReceiveQuoteNotifications = source.IsReceiveQuoteNotifications,
        IsReceiveInvoiceNotifications = source.IsReceiveInvoiceNotifications,
        BillingStreet = source.BillingStreet, BillingCity = source.BillingCity, BillingState = source.BillingState,
        BillingCountry = source.BillingCountry, BillingPostalCode = source.BillingPostalCode,
        BillingAddress = source.BillingAddress, IsArchived = source.IsArchived,
        CustomFieldValues = source.CustomFieldValues?.Select(ToResponse).ToList() ?? [],
        Notes = source.Notes?.Select(ToResponse).ToList() ?? [],
        Properties = source.Properties?.Select(ToResponse).ToList() ?? [],
        CustomerPhones = source.CustomerPhones?.Select(ToResponse).ToList() ?? [],
        LastActivity = source.LastActivity, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static CustomFieldValueResponseDto ToResponse(this CustomFieldValue source) => new()
    {
        Id = source.Id, CustomerId = source.CustomerId, CustomFieldId = source.CustomFieldId,
        Value = source.Value, CustomField = source.CustomField?.ToResponse(), CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static CustomFieldResponseDto ToResponse(this CustomField source) => new()
    {
        Id = source.Id, WorkspaceId = source.WorkspaceId, FieldName = source.FieldName, FieldType = source.FieldType,
        DefaultValue = source.DefaultValue, DropdownOptions = source.DropdownOptions, IsRequired = source.IsRequired, IsArchived = source.IsArchived
    };

    public static CustomerPhoneResponseDto ToResponse(this CustomerPhone source) => new()
    {
        Id = source.Id, PhoneType = source.PhoneType, PhoneNumber = source.PhoneNumber,
        IsReceiveMessage = source.IsReceiveMessage, CustomerId = source.CustomerId,
        CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static NoteResponseDto ToResponse(this Note source) => new()
    {
        Id = source.Id, WorkspaceId = source.WorkspaceId, CreatedBy = source.CreatedBy,
        CreatedByName = source.CreatedByName, NoteText = source.NoteText, PathFile = source.PathFile,
        CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static LineItemResponseDto ToResponse(this LineItem source) => new()
    {
        Id = source.Id, ServiceItemId = source.ServiceItemId, Name = source.Name, Description = source.Description,
        UnitPrice = source.UnitPrice, Cost = source.Cost, IsOptional = source.IsOptional, IsTaxable = source.IsTaxable,
        Quantity = source.Quantity, Total = source.Total, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static UserSummaryResponseDto ToResponse(this User source) => new()
    {
        Id = source.Id, Email = source.Email, FirstName = source.FirstName, LastName = source.LastName,
        FullName = source.FullName, WorkspaceId = source.WorkspaceId, Role = source.Role
    };

    public static EmployeeResponseDto ToResponse(this Employee source) => new()
    {
        Id = source.Id, UserId = source.UserId, User = source.User?.ToResponse(), WorkspaceId = source.WorkspaceId,
        Position = source.Position, Department = source.Department, Status = source.Status, HireDate = source.HireDate,
        PhoneNumber = source.PhoneNumber, ImageUrl = source.ImageUrl, Location = source.Location,
        IsAvailable = source.IsAvailable, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static PaymentResponseDto ToResponse(this Payment source) => new()
    {
        Id = source.Id, InvoiceId = source.InvoiceId, JobId = source.JobId, Amount = source.Amount,
        Method = source.Method, Status = source.Status, ProcessorReference = source.ProcessorReference,
        PaidAt = source.PaidAt, RecordedByUserId = source.RecordedByUserId, Note = source.Note,
        CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static StatusChangeResponseDto ToResponse(this StatusChange source) => new()
    {
        Id = source.Id, FromStatus = source.FromStatus, ToStatus = source.ToStatus, ChangedAt = source.ChangedAt,
        ChangedBy = source.ChangedBy, Notes = source.Notes, JobId = source.JobId
    };

    public static RecurrenceRuleResponseDto ToResponse(this RecurrenceRule source) => new()
    {
        Id = source.Id, Frequency = source.Frequency, Interval = source.Interval, DaysOfWeek = source.DaysOfWeek,
        DayOfMonth = source.DayOfMonth, WeekOfMonth = source.WeekOfMonth, DayOfWeekInMonth = source.DayOfWeekInMonth,
        MonthOfYear = source.MonthOfYear, EndType = source.EndType, OccurrenceCount = source.OccurrenceCount, EndDate = source.EndDate
    };

    public static JobResponseDto ToResponse(this Job source) => new()
    {
        Id = source.Id, WorkspaceId = source.WorkspaceId, Title = source.Title, Description = source.Description,
        CustomerId = source.CustomerId, Customer = source.Customer?.ToResponse(), PropertyId = source.PropertyId,
        Property = source.Property?.ToResponse(), JobType = source.JobType, LineItems = source.LineItems.Select(ToResponse).ToList(),
        Status = source.Status, StatusHistory = source.StatusHistory.Select(ToResponse).ToList(), Priority = source.Priority,
        StartDateTime = source.StartDateTime, EndDateTime = source.EndDateTime, RecurrenceRuleId = source.RecurrenceRuleId,
        RecurrenceRule = source.RecurrenceRule?.ToResponse(), ArrivalWindow = source.ArrivalWindow,
        EstimatedDurationMinutes = source.EstimatedDurationMinutes, AssignedTeamMembers = source.AssignedTeamMembers.Select(ToResponse).ToList(),
        PaymentStatus = source.PaymentStatus, DepositAmount = source.DepositAmount, Payments = source.Payments.Select(ToResponse).ToList(),
        DepositPaid = source.DepositPaid, DepositBalanceDue = source.DepositBalanceDue, IsDepositPaid = source.IsDepositPaid,
        DiscountType = source.DiscountType, DiscountValue = source.DiscountValue, TaxRate = source.TaxRate,
        TaxAmount = source.TaxAmount, Subtotal = source.Subtotal, TotalAmount = source.TotalAmount,
        SendInvoice = source.SendInvoice, SendReminder = source.SendReminder, ReminderDaysBefore = source.ReminderDaysBefore,
        ConfirmationSent = source.ConfirmationSent, ReminderSent = source.ReminderSent, InvoiceSent = source.InvoiceSent,
        JobNumber = source.JobNumber, CompletedAt = source.CompletedAt, CreatedBy = source.CreatedBy, Source = source.Source,
        Tags = source.Tags, CustomerNotes = source.CustomerNotes, InternalNotes = source.InternalNotes,
        CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static InvoiceResponseDto ToResponse(this Invoice source) => new()
    {
        Id = source.Id, WorkspaceId = source.WorkspaceId, CustomerId = source.CustomerId, Customer = source.Customer?.ToResponse(),
        InvoiceNumber = source.InvoiceNumber, PropertyId = source.PropertyId, Property = source.Property?.ToResponse(),
        JobId = source.JobId, Job = source.Job?.ToSummary(), Title = source.Title, LineItems = source.LineItems.Select(ToResponse).ToList(),
        Payments = source.Payments.Select(ToResponse).ToList(), TaxRate = source.TaxRate, Discount = source.DiscountAmount,
        DiscountType = source.DiscountType, Subtotal = source.Subtotal, TaxAmount = source.TaxAmount, Total = source.Total,
        AmountPaid = source.AmountPaid, BalanceDue = source.BalanceDue, Status = source.Status, IsPaid = source.IsPaid,
        SentAt = source.SentAt, IssueDate = source.IssueDate, DueDate = source.DueDate, PaymentTerms = source.PaymentTerms,
        Notes = source.Notes, InternalNotes = source.InternalNotes, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static JobSummaryResponseDto ToSummary(this Job source) => new()
    {
        Id = source.Id, JobNumber = source.JobNumber, Title = source.Title, Status = source.Status
    };

    public static QuoteResponseDto ToResponse(this Quote source) => new()
    {
        Id = source.Id, WorkspaceId = source.WorkspaceId, JobId = source.JobId, CustomerId = source.CustomerId,
        Customer = source.Customer?.ToResponse(), CreatedByUserId = source.CreatedByUserId, CreatedByUser = source.CreatedByUser?.ToResponse(),
        AssignedToUserId = source.AssignedToUserId, AssignedToUser = source.AssignedToUser?.ToResponse(), Title = source.Title,
        PropertyId = source.PropertyId, Property = source.Property?.ToResponse(), QuoteNumber = source.QuoteNumber, Status = source.Status,
        SentAt = source.SentAt, Viewed = source.Viewed, ViewedAt = source.ViewedAt, ExpiresAt = source.ExpiresAt,
        PaymentTerms = source.PaymentTerms, DepositAmount = source.DepositAmount, LineItems = source.LineItems.Select(ToResponse).ToList(),
        DiscountType = source.DiscountType, DiscountValue = source.DiscountValue, TaxRate = source.TaxRate, Subtotal = source.Subtotal,
        Discount = source.Discount, TaxAmount = source.TaxAmount, Total = source.Total, CustomerNotes = source.CustomerNotes.Select(ToResponse).ToList(),
        InternalNotes = source.InternalNotes.Select(ToResponse).ToList(), CustomerMessages = source.CustomerMessages,
        ActivityHistory = source.ActivityHistory.Select(ToResponse).ToList(), Source = source.Source,
        Attachments = source.Attachments.Select(ToResponse).ToList(), IsArchived = source.IsArchived,
        CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static ActivityHistoryResponseDto ToResponse(this ActivityHistory source) => new()
    {
        Id = source.Id, Type = source.Type, Action = source.Action, EntityType = source.EntityType,
        EntityId = source.EntityId, WorkspaceId = source.WorkspaceId, ChangedAt = source.ChangedAt,
        ChangedBy = source.ChangedBy, ChangedByName = source.ChangedByName, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };

    public static QuoteAttachmentResponseDto ToResponse(this QuoteAttachment source) => new()
    {
        Id = source.Id, FileName = source.FileName, Url = source.Url, QuoteId = source.QuoteId, CreatedAt = source.CreatedAt
    };

    public static LeadResponseDto ToResponse(this Lead source) => new()
    {
        Id = source.Id, CustomerId = source.CustomerId, Customer = source.Customer?.ToResponse(), QuoteId = source.QuoteId, ConvertedToJobId = source.ConvertedToJobId,
        WorkspaceId = source.WorkspaceId, FirstName = source.FirstName, LastName = source.LastName, Email = source.Email,
        PhoneNumber = source.PhoneNumber, Source = source.Source, Description = source.Description, StartDateTime = source.StartDateTime,
        EndDateTime = source.EndDateTime, Status = source.Status, Priority = source.Priority,
        LineItems = source.LineItems.Select(ToResponse).ToList(), Notes = source.Notes, CreatedAt = source.CreatedAt, UpdatedAt = source.UpdatedAt
    };
}
