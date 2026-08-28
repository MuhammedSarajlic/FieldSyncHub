using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;

namespace backend.Tests;

/// <summary>
/// End-to-end check that {workspaceId} route segments are validated against the
/// caller's own workspace claim - i.e. [Authorize] alone is not enough to stop
/// company A from reading company B's data by editing the GUID in the URL.
/// </summary>
public class WorkspaceAccessFilterTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public WorkspaceAccessFilterTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Request_for_a_different_workspace_than_the_callers_own_is_forbidden()
    {
        var callerWorkspaceId = Guid.NewGuid();
        var otherWorkspaceId = Guid.NewGuid();
        var client = AuthenticatedClient(callerWorkspaceId);

        var response = await client.GetAsync($"/api/customfield/workspace/{otherWorkspaceId}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Request_for_the_callers_own_workspace_is_not_forbidden()
    {
        var callerWorkspaceId = Guid.NewGuid();
        var client = AuthenticatedClient(callerWorkspaceId);

        var response = await client.GetAsync($"/api/customfield/workspace/{callerWorkspaceId}");

        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Request_with_no_workspace_claim_is_forbidden()
    {
        var client = AuthenticatedClient(workspaceId: null);

        var response = await client.GetAsync($"/api/customfield/workspace/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private HttpClient AuthenticatedClient(Guid? workspaceId)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateToken(workspaceId));
        return client;
    }

    private string CreateToken(Guid? workspaceId)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, "Test User"),
            new(ClaimTypes.Email, "test@example.com"),
            new("workspaceId", workspaceId?.ToString() ?? ""),
            new(ClaimTypes.Role, "Employee")
        };

        return _factory.CreateTestToken(claims);
    }
}
