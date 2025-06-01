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
using backend.Services.Phones;
using backend.Services.PropertyService;
using backend.Services.QuoteService;
using backend.Services.ServiceItemService;
using backend.Services.TokenService;
using backend.Services.UserService;
using backend.Services.WorkspaceService;

namespace backend.Extensions;

public static class ServiceExtension
{
    public static void AddService(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICustomFieldService, CustomFieldService>();
        services.AddScoped<ICustomFieldServiceValue, CustomFieldServiceValue>();
        services.AddScoped<IWorkspaceService, WorkspaceService>();
        services.AddScoped<ICustomerPhoneService, CustomerPhoneService>();
        services.AddScoped<INotesService, NotesService>();
        services.AddScoped<IPropertyService, PropertyService>();
        services.AddScoped<IServiceItemService, ServiceItemService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IEmployeeInviteService, EmployeeInviteService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IQuoteService, QuoteService>();
    }
}