using System.Net;

namespace backend.Tests;

public class HealthEndpointTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public HealthEndpointTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Health_endpoint_is_anonymous_and_returns_a_correlation_id()
    {
        var response = await _factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("X-Correlation-ID", out var values));
        Assert.Matches("^[A-Za-z0-9_.-]+$", values.Single());
    }

    [Fact]
    public async Task Ready_endpoint_checks_the_database_without_authentication()
    {
        var response = await _factory.CreateClient().GetAsync("/ready");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Healthy", body);
    }
}
