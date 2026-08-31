using backend.Services.AuthService;
using backend.Services.CustomerService;
using backend.Services.CustomFieldService;
using backend.Services.CustomFieldValueService;
using backend.Services.EmailService;
using backend.Services.EmployeeInviteService;
using backend.Services.EmployeeService;
using backend.Services.InvoiceService;
using backend.Services.JobService;
using backend.Services.NotesService;
using backend.Services.CurrentUserService;
using backend.Services.CustomerPhoneService;
using backend.Services.PropertyService;
using backend.Services.QuoteService;
using backend.Services.LeadService;
using backend.Services.ServiceItemService;
using backend.Services.TokenService;
using backend.Services.UserService;
using backend.Services.WorkspaceService;
using backend.Services.PdfService;
using backend.Services.EventService;
using backend.Services.CalendarService;
using backend.Services.ActivityHistoryService;
using backend.Services.StorageService;
using backend.Services.WebhookService;
using backend.Services.StripeService;
using backend.Services.AccountingService;
using Resend;

namespace backend.Extensions;

public static class ServiceExtension
{
    public static void AddService(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddResend(options =>
        {
            options.ApiToken = configuration["AppSettings:Resend:ApiToken"] ?? string.Empty;
            // A missing/empty token would otherwise throw on every request that
            // sends email; EmailService.IsConfigured is what actually gates sending.
            options.ThrowExceptions = false;
        });

        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICustomerUnitOfWork, CustomerUnitOfWork>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICustomFieldService, CustomFieldService>();
        services.AddScoped<ICustomFieldServiceValue, CustomFieldServiceValue>();
        services.AddScoped<IWorkspaceService, WorkspaceService>();
        services.AddScoped<ICustomerPhoneService, CustomerPhoneService>();
        services.AddScoped<INotesService, NotesService>();
        services.AddScoped<IPropertyService, PropertyService>();
        services.AddScoped<IGeocodingService, GeocodingService>();
        services.AddScoped<IServiceItemService, ServiceItemService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IEmployeeInviteService, EmployeeInviteService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IQuoteService, QuoteService>();
        services.AddScoped<ILeadService, LeadService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<ICalendarService, CalendarService>();
        services.AddScoped<QuotePdfService>();
        services.AddScoped<IStorageService, SupabaseStorageService>();
        services.AddScoped<IActivityHistoryService, ActivityHistoryService>();
        services.AddScoped<IWebhookDispatcher, WebhookDispatcher>();
        services.AddScoped<IStripePaymentService, StripePaymentService>();
        services.AddScoped<IAccountingSyncService, AccountingSyncService>();
    }
}
