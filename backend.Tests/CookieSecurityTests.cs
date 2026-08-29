using backend.Services.TokenService;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// The refresh cookie's Secure flag was hardcoded false with a "change to true in
/// production" comment - exactly the kind of manual step a real deployment forgets.
/// It's derived from configuration now: an explicit AppSettings:CookieSecure always
/// wins, and otherwise it defaults to secure everywhere except local dev/test.
/// </summary>
public class CookieSecurityTests
{
    private static IConfiguration ConfigWith(string? cookieSecure) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["AppSettings:CookieSecure"] = cookieSecure })
            .Build();

    [Fact]
    public void Explicit_true_wins_regardless_of_environment()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
        try
        {
            Assert.True(CookieSecurity.ShouldUseSecureCookies(ConfigWith("true")));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);
        }
    }

    [Fact]
    public void Explicit_false_wins_regardless_of_environment()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Production");
        try
        {
            Assert.False(CookieSecurity.ShouldUseSecureCookies(ConfigWith("false")));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);
        }
    }

    [Theory]
    [InlineData("Development")]
    [InlineData("Testing")]
    public void Defaults_to_insecure_in_local_dev_and_test_environments(string environmentName)
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", environmentName);
        try
        {
            Assert.False(CookieSecurity.ShouldUseSecureCookies(ConfigWith(null)));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);
        }
    }

    [Theory]
    [InlineData("Production")]
    [InlineData("Staging")]
    [InlineData(null)]
    public void Defaults_to_secure_everywhere_else(string? environmentName)
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", environmentName);
        try
        {
            Assert.True(CookieSecurity.ShouldUseSecureCookies(ConfigWith(null)));
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);
        }
    }
}
