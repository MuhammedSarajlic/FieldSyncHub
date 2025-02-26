using backend.Services.AuthService;
using backend.Services.CustomerService;
using backend.Services.CustomFieldService;
using backend.Services.CustomFieldValueService;
using backend.Services.UserService;

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
    }
}