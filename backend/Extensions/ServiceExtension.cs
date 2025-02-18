using backend.Services.UserService;

namespace backend.Extensions;

public static class ServiceExtension
{
    public static void AddService(this IServiceCollection services)
    { 
        services.AddScoped<IUserService, UserService>();
    }
}