using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace backend.Tests;

public class AuthorizationDefaultsFactory : WebApplicationFactory<Program>
{
    /// <summary>
    /// Signs a test JWT with the same key the test host itself is configured with -
    /// read from the (gitignored, per-environment) appsettings.json/environment
    /// rather than a hardcoded value, since a secret committed in test source is
    /// exactly as leaked as one in appsettings.json.
    /// </summary>
    public string CreateTestToken(IEnumerable<Claim> claims)
    {
        using var scope = Services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var signingKey = configuration["AppSettings:Token"]
            ?? throw new InvalidOperationException("AppSettings:Token is not configured for the test host.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddMinutes(5), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

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
