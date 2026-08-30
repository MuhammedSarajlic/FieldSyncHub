using backend.Dtos.CustomerDto;
using backend.Dtos.CustomerPhoneDto;
using backend.Dtos.CustomFieldDto;
using backend.Dtos.CustomFieldValueDto;
using backend.Dtos.EmployeeInviteDto;
using backend.Dtos.EventDto;
using backend.Dtos.InvoiceDto;
using backend.Dtos.LeadDto;
using backend.Dtos.LineItemDto;
using backend.Dtos.PropertyDto;
using backend.Dtos.QuoteDto;
using backend.Dtos.NotesDto;
using backend.Dtos.RecurrenceRuleDto;
using backend.Dtos.ServiceItemDto;
using backend.Dtos.UserDto;
using backend.Dtos.WorkspaceDto;
using FluentValidation;
using backend.Dtos.JobDto;

namespace backend.Validation;

public sealed class CreateLineItemDtoValidator : AbstractValidator<CreateLineItemDto>
{
    public CreateLineItemDtoValidator()
    {
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Cost).GreaterThanOrEqualTo(0).When(x => x.Cost.HasValue);
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

public sealed class UpdateLineItemDtoValidator : AbstractValidator<UpdateLineItemDto>
{
    public UpdateLineItemDtoValidator()
    {
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0).When(x => x.UnitPrice.HasValue);
        RuleFor(x => x.Cost).GreaterThanOrEqualTo(0).When(x => x.Cost.HasValue);
        RuleFor(x => x.Quantity).GreaterThan(0).When(x => x.Quantity.HasValue);
    }
}

public sealed class CreateJobDtoValidator : AbstractValidator<CreateJobDto>
{
    public CreateJobDtoValidator(IValidator<CreateLineItemDto> lineItemValidator)
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EndDateTime).GreaterThan(x => x.StartDateTime);
        RuleFor(x => x.EstimatedDurationMinutes).GreaterThan(0);
        RuleFor(x => x.ArrivalWindow).GreaterThanOrEqualTo(0).When(x => x.ArrivalWindow.HasValue);
        RuleFor(x => x.DiscountValue).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100);
        RuleFor(x => x.DepositAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ReminderDaysBefore).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.JobType).IsInEnum();
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.PaymentStatus).IsInEnum();
        RuleFor(x => x.DiscountType).IsInEnum();
        RuleForEach(x => x.LineItems).SetValidator(lineItemValidator);
        RuleForEach(x => x.AssignedTeamMemberIds).NotEmpty();
    }
}

public sealed class UpdateJobDtoValidator : AbstractValidator<UpdateJobDto>
{
    public UpdateJobDtoValidator(IValidator<UpdateLineItemDto> lineItemValidator)
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.EndDateTime).GreaterThan(x => x.StartDateTime)
            .When(x => x.StartDateTime != default && x.EndDateTime != default);
        RuleFor(x => x.EstimatedDurationMinutes).GreaterThan(0).When(x => x.EstimatedDurationMinutes.HasValue);
        RuleFor(x => x.ArrivalWindow).GreaterThanOrEqualTo(0).When(x => x.ArrivalWindow.HasValue);
        RuleFor(x => x.DepositAmount).GreaterThanOrEqualTo(0).When(x => x.DepositAmount.HasValue);
        RuleFor(x => x.DiscountValue).GreaterThanOrEqualTo(0).When(x => x.DiscountValue.HasValue);
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100).When(x => x.TaxRate.HasValue);
        RuleFor(x => x.ReminderDaysBefore).GreaterThanOrEqualTo(0).When(x => x.ReminderDaysBefore.HasValue);
        RuleFor(x => x.JobType).IsInEnum().When(x => x.JobType.HasValue);
        RuleFor(x => x.Priority).IsInEnum().When(x => x.Priority.HasValue);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
        RuleFor(x => x.PaymentStatus).IsInEnum().When(x => x.PaymentStatus.HasValue);
        RuleFor(x => x.DiscountType).IsInEnum().When(x => x.DiscountType.HasValue);
        RuleForEach(x => x.LineItems).SetValidator(lineItemValidator);
        RuleForEach(x => x.AssignedTeamMemberIds).NotEmpty();
    }
}

public sealed class CreateCustomerDtoValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCustomerDtoValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleForEach(x => x.Emails).EmailAddress().When(x => x.Emails != null);
    }
}

public sealed class UpdateCustomerDtoValidator : AbstractValidator<UpdateCustomerDto>
{
    public UpdateCustomerDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100).When(x => x.FirstName != null);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100).When(x => x.LastName != null);
        RuleForEach(x => x.Emails).EmailAddress().When(x => x.Emails != null);
    }
}

public sealed class CreateInvoiceDtoValidator : AbstractValidator<CreateInvoiceDto>
{
    public CreateInvoiceDtoValidator(IValidator<CreateLineItemDto> lineItemValidator)
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100);
        RuleFor(x => x.Discount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DiscountType).IsInEnum();
        RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.IssueDate).When(x => x.DueDate.HasValue);
        RuleForEach(x => x.LineItems).SetValidator(lineItemValidator);
    }
}

public sealed class UpdateInvoiceDtoValidator : AbstractValidator<UpdateInvoiceDto>
{
    public UpdateInvoiceDtoValidator(IValidator<UpdateLineItemDto> lineItemValidator)
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100).When(x => x.TaxRate.HasValue);
        RuleFor(x => x.Discount).GreaterThanOrEqualTo(0).When(x => x.Discount.HasValue);
        RuleFor(x => x.DiscountType).IsInEnum().When(x => x.DiscountType.HasValue);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
        RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.IssueDate).When(x => x.DueDate.HasValue && x.IssueDate.HasValue);
        RuleForEach(x => x.LineItems).SetValidator(lineItemValidator);
    }
}

public sealed class CreateQuoteDtoValidator : AbstractValidator<CreateQuoteDto>
{
    public CreateQuoteDtoValidator(IValidator<CreateLineItemDto> lineItemValidator)
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.CreatedByUserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.DiscountValue).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100);
        RuleFor(x => x.DepositAmount).GreaterThanOrEqualTo(0).When(x => x.DepositAmount.HasValue);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.DiscountType).IsInEnum();
        RuleForEach(x => x.LineItems).SetValidator(lineItemValidator);
    }
}

public sealed class UpdateQuoteDtoValidator : AbstractValidator<UpdateQuoteDto>
{
    public UpdateQuoteDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.PropertyId).NotEmpty().When(x => x.PropertyId.HasValue);
        RuleFor(x => x.DiscountValue).GreaterThanOrEqualTo(0).When(x => x.DiscountValue.HasValue);
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100).When(x => x.TaxRate.HasValue);
        RuleFor(x => x.DepositAmount).GreaterThanOrEqualTo(0).When(x => x.DepositAmount.HasValue);
        RuleFor(x => x.DiscountType).IsInEnum().When(x => x.DiscountType.HasValue);
    }
}

public sealed class CreateLeadDtoValidator : AbstractValidator<CreateLeadDto>
{
    public CreateLeadDtoValidator(IValidator<CreateLineItemDto> lineItemValidator)
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.FirstName).MaximumLength(100).When(x => x.FirstName != null);
        RuleFor(x => x.LastName).MaximumLength(100).When(x => x.LastName != null);
        RuleFor(x => x)
            .Must(x => x.CustomerId.HasValue
                || !string.IsNullOrWhiteSpace(x.FirstName)
                || !string.IsNullOrWhiteSpace(x.LastName)
                || !string.IsNullOrWhiteSpace(x.Email)
                || !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("A standalone lead must include contact information.");
        RuleFor(x => x.EndDateTime).GreaterThan(x => x.StartDateTime)
            .When(x => x.StartDateTime.HasValue && x.EndDateTime.HasValue);
        RuleFor(x => x.Priority).IsInEnum();
        RuleForEach(x => x.LineItems).SetValidator(lineItemValidator);
    }
}

public sealed class UpdateLeadDtoValidator : AbstractValidator<UpdateLeadDto>
{
    public UpdateLeadDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000).When(x => x.Description != null);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.EndDateTime).GreaterThan(x => x.StartDateTime)
            .When(x => x.StartDateTime.HasValue && x.EndDateTime.HasValue);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
        RuleFor(x => x.Priority).IsInEnum().When(x => x.Priority.HasValue);
    }
}

public sealed class CreatePropertyDtoValidator : AbstractValidator<CreatePropertyDto>
{
    public CreatePropertyDtoValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Street).NotEmpty().MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
        RuleFor(x => x).Must(x => x.Latitude.HasValue == x.Longitude.HasValue)
            .WithMessage("Latitude and longitude must be provided together.");
    }
}

public sealed class UpdatePropertyDtoValidator : AbstractValidator<UpdatePropertyDto>
{
    public UpdatePropertyDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
        RuleFor(x => x).Must(x => x.Latitude.HasValue == x.Longitude.HasValue)
            .WithMessage("Latitude and longitude must be provided together.");
    }
}

public sealed class CreateServiceItemDtoValidator : AbstractValidator<CreateServiceItemDto>
{
    public CreateServiceItemDtoValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Cost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Type).IsInEnum();
    }
}

public sealed class UpdateServiceItemDtoValidator : AbstractValidator<UpdateServiceItemDto>
{
    public UpdateServiceItemDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200).When(x => x.Name != null);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0).When(x => x.UnitPrice.HasValue);
        RuleFor(x => x.Cost).GreaterThanOrEqualTo(0).When(x => x.Cost.HasValue);
        RuleFor(x => x.Type).IsInEnum().When(x => x.Type.HasValue);
    }
}

public sealed class CreateEventDtoValidator : AbstractValidator<CreateEventDto>
{
    public CreateEventDtoValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.CreatedBy).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EndDateTime).GreaterThan(x => x.StartDateTime);
    }
}

public sealed class UpdateEventDtoValidator : AbstractValidator<UpdateEventDto>
{
    public UpdateEventDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EndDateTime).GreaterThan(x => x.StartDateTime);
    }
}

public sealed class CreateWorkspaceDtoValidator : AbstractValidator<CreateWorkspaceDto>
{
    public CreateWorkspaceDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Currency).Length(3);
        RuleFor(x => x.DefaultTaxRate).InclusiveBetween(0, 100);
        RuleFor(x => x.CreatedByUserId).NotEmpty();
    }
}

public sealed class UpdateWorkspaceDtoValidator : AbstractValidator<UpdateWorkspaceDto>
{
    public UpdateWorkspaceDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200).When(x => x.Name != null);
        RuleFor(x => x.Currency).Length(3).When(x => x.Currency != null);
        RuleFor(x => x.DefaultTaxRate).InclusiveBetween(0, 100).When(x => x.DefaultTaxRate.HasValue);
    }
}

public sealed class UserRegisterDtoValidator : AbstractValidator<UserRegisterDto>
{
    public UserRegisterDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MinimumLength(8);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
    }
}

public sealed class UserLoginDtoValidator : AbstractValidator<UserLoginDto>
{
    public UserLoginDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class CreateNoteDtoValidator : AbstractValidator<CreateNoteDto>
{
    public CreateNoteDtoValidator()
    {
        RuleFor(x => x.CreatedBy).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CreatedByName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.NoteText).NotEmpty().When(x => string.IsNullOrWhiteSpace(x.PathFile));
    }
}

public sealed class UpdateNoteDtoValidator : AbstractValidator<UpdateNoteDto>
{
    public UpdateNoteDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.NoteText).NotEmpty().When(x => string.IsNullOrWhiteSpace(x.PathFile));
    }
}

public sealed class SendQuoteDtoValidator : AbstractValidator<SendQuoteDto>
{
    public SendQuoteDtoValidator()
    {
        RuleFor(x => x.Recipients).NotEmpty();
        RuleForEach(x => x.Recipients).EmailAddress();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(10000);
        RuleForEach(x => x.Attachments).SetValidator(new SendQuoteAttachmentDtoValidator());
    }
}

public sealed class SendQuoteAttachmentDtoValidator : AbstractValidator<SendQuoteAttachmentDto>
{
    public SendQuoteAttachmentDtoValidator()
    {
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Content).NotEmpty();
    }
}

public sealed class SendInvoiceDtoValidator : AbstractValidator<SendInvoiceDto>
{
    public SendInvoiceDtoValidator()
    {
        RuleFor(x => x.Recipients).NotEmpty();
        RuleForEach(x => x.Recipients).EmailAddress();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(10000);
        RuleForEach(x => x.Attachments).SetValidator(new SendInvoiceAttachmentDtoValidator());
    }
}

public sealed class SendInvoiceAttachmentDtoValidator : AbstractValidator<SendInvoiceAttachmentDto>
{
    public SendInvoiceAttachmentDtoValidator()
    {
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Content).NotEmpty();
    }
}

public sealed class RecordInvoicePaymentDtoValidator : AbstractValidator<RecordInvoicePaymentDto>
{
    public RecordInvoicePaymentDtoValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Method).IsInEnum();
    }
}

public sealed class RecordJobDepositPaymentDtoValidator : AbstractValidator<RecordJobDepositPaymentDto>
{
    public RecordJobDepositPaymentDtoValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Method).IsInEnum();
    }
}

public sealed class EmployeeInviteRequestValidator : AbstractValidator<EmployeeInviteRequest>
{
    public EmployeeInviteRequestValidator()
    {
        RuleFor(x => x.Emails).NotEmpty().Must(emails => emails.Count <= 100);
        RuleForEach(x => x.Emails).EmailAddress();
        RuleFor(x => x.Role).IsInEnum();
    }
}

public sealed class CreateCustomFieldDtoValidator : AbstractValidator<CreateCustomFieldDto>
{
    public CreateCustomFieldDtoValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.FieldName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FieldType).IsInEnum();
    }
}

public sealed class UpdateCustomFieldDtoValidator : AbstractValidator<UpdateCustomFieldDto>
{
    public UpdateCustomFieldDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty().When(x => x.Id.HasValue);
        RuleFor(x => x.FieldName).NotEmpty().MaximumLength(200).When(x => x.FieldName != null);
        RuleFor(x => x.FieldType).IsInEnum().When(x => x.FieldType.HasValue);
    }
}

public sealed class CreateCustomFieldValueDtoValidator : AbstractValidator<CreateCustomFieldValueDto>
{
    public CreateCustomFieldValueDtoValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.CustomFieldId).NotEmpty();
    }
}

public sealed class UpdateCustomFieldValueDtoValidator : AbstractValidator<UpdateCustomFieldValueDto>
{
    public UpdateCustomFieldValueDtoValidator() => RuleFor(x => x.Id).NotEmpty();
}

public sealed class CreateCustomerPhoneDtoValidator : AbstractValidator<CreateCustomerPhoneDto>
{
    public CreateCustomerPhoneDtoValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PhoneType).IsInEnum();
    }
}

public sealed class UpdateCustomerPhoneDtoValidator : AbstractValidator<UpdateCustomerPhoneDto>
{
    public UpdateCustomerPhoneDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(50).When(x => x.PhoneNumber != null);
        RuleFor(x => x.PhoneType).IsInEnum().When(x => x.PhoneType.HasValue);
    }
}

public sealed class CreateRecurrenceRuleDtoValidator : AbstractValidator<CreateRecurrenceRuleDto>
{
    public CreateRecurrenceRuleDtoValidator()
    {
        RuleFor(x => x.Frequency).IsInEnum();
        RuleFor(x => x.EndType).IsInEnum();
        RuleFor(x => x.Interval).GreaterThan(0);
        RuleFor(x => x.OccurrenceCount).GreaterThan(0).When(x => x.OccurrenceCount.HasValue);
        RuleFor(x => x.EndDate).GreaterThan(DateTime.UtcNow).When(x => x.EndDate.HasValue);
    }
}

public sealed class UpdateRecurrenceRuleDtoValidator : AbstractValidator<UpdateRecurrenceRuleDto>
{
    public UpdateRecurrenceRuleDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Frequency).IsInEnum();
        RuleFor(x => x.EndType).IsInEnum();
        RuleFor(x => x.Interval).GreaterThan(0);
    }
}

public sealed class ForgotPasswordDtoValidator : AbstractValidator<ForgotPasswordDto>
{
    public ForgotPasswordDtoValidator() => RuleFor(x => x.Email).NotEmpty().EmailAddress();
}

public sealed class ResetPasswordDtoValidator : AbstractValidator<ResetPasswordDto>
{
    public ResetPasswordDtoValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).MinimumLength(8);
    }
}
