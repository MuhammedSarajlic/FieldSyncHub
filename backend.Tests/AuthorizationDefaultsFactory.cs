using backend.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests;

public class AuthorizationDefaultsFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // AddDbContext registers more than just DbContextOptions<DataContext> (e.g.
            // IDbContextOptionsConfiguration<DataContext>) - removing only the options
            // descriptor leaves the MySQL configuration action registered alongside the
            // InMemory one added below, which EF Core rejects as two providers on one context.
            var dataContextDescriptors = services
                .Where(d => d.ServiceType.IsGenericType
                    && d.ServiceType.GetGenericArguments().Contains(typeof(DataContext)))
                .ToList();
            foreach (var d in dataContextDescriptors)
            {
                services.Remove(d);
            }

            services.AddDbContext<DataContext>(options =>
                options.UseInMemoryDatabase("AuthorizationDefaultsTests"));
        });
    }
}
