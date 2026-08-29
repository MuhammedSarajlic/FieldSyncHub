using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;

namespace backend.Tests;

/// <summary>
/// GetQuotePdf returned ex.Message straight to the caller - any unexpected internal
/// exception (a raw EF/SQL error, a null-reference source, a file path) was handed
/// to whoever asked. These pin that a failure returns a generic message instead,
/// while still failing with a sensible status code.
/// </summary>
public class ErrorResponseLeakTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public ErrorResponseLeakTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetQuotePdf_for_a_nonexistent_quote_does_not_leak_exception_detail()
    {
        var client = _factory.CreateClient();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new("workspaceId", Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, "Owner"),
        };
        var token = _factory.CreateTestToken(claims);

        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/quote/{Guid.NewGuid()}/pdf");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(request);

        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.DoesNotContain("Exception", body);
        Assert.DoesNotContain("System.", body);
        Assert.DoesNotContain("at backend.", body);
    }
}
