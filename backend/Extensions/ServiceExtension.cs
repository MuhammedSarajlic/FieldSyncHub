using backend.Services.AuthService;
using backend.Services.CustomerService;
using backend.Services.CustomFieldService;
using backend.Services.CustomFieldValueService;
using backend.Services.NotesService;
using backend.Services.Phones;
using backend.Services.PropertyService;
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
    }
}