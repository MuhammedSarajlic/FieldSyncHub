namespace backend.Tests;

/// <summary>
/// No CSP, no X-Content-Type-Options, no Referrer-Policy - since the frontend keeps
/// its access token in localStorage rather than an HttpOnly cookie, any XSS there
/// is a full account takeover with nothing else standing in the way. A CSP can't
/// fix an XSS bug, but it's the cheapest available mitigation, and the header
/// hygiene here (nosniff, Referrer-Policy, frame-ancestors) is what a baseline
/// security scan checks for on any HTTP response, JSON API or not.
/// </summary>
public class SecurityHeadersTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public SecurityHeadersTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Every_response_carries_the_baseline_security_headers()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/auth/login");

        Assert.True(response.Headers.Contains("Content-Security-Policy") || response.Content.Headers.Contains("Content-Security-Policy"));
        Assert.True(response.Headers.Contains("X-Content-Type-Options"));
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.True(response.Headers.Contains("Referrer-Policy"));
        Assert.True(response.Headers.Contains("X-Frame-Options"));
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
    }

    [Fact]
    public async Task The_csp_denies_everything_by_default_outside_development()
    {
        // The test host runs in the "Testing" environment (not Development), so
        // this exercises the same locked-down policy a real deployment gets.
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/auth/login");
        var csp = response.Headers.Contains("Content-Security-Policy")
            ? response.Headers.GetValues("Content-Security-Policy").Single()
            : response.Content.Headers.GetValues("Content-Security-Policy").Single();

        Assert.Contains("default-src 'none'", csp);
    }
}
