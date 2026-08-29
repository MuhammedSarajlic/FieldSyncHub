namespace backend.Services.TokenService;

/// <summary>
/// The refresh cookie's Secure flag used to be hardcoded false with a "change to
/// true in production" comment - the kind of manual step that's easy to forget on
/// an actual deployment, in code that already calls UseHttpsRedirection. This
/// derives it from configuration instead: an explicit AppSettings:CookieSecure
/// wins if set, otherwise it defaults to true everywhere except Development/Testing
/// (both plain-HTTP-over-localhost contexts) so a real deployment is secure by
/// default with no environment-specific flag to remember.
/// </summary>
public static class CookieSecurity
{
    public static bool ShouldUseSecureCookies(IConfiguration configuration)
    {
        var explicitValue = configuration["AppSettings:CookieSecure"];
        if (bool.TryParse(explicitValue, out var configured))
        {
            return configured;
        }

        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        return !string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(environmentName, "Testing", StringComparison.OrdinalIgnoreCase);
    }
}
