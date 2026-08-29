using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;

namespace backend.Tests;

/// <summary>
/// UserRole.Owner/Admin/Employee was issued as a claim but checked nowhere outside a
/// handful of endpoints - any authenticated user, including an Employee, could delete
/// invoices, customers, jobs, edit the pricebook, manage teammates, change workspace
/// settings, or pull a data export. These pin that the destructive/financial/settings
/// surface now requires Owner or Admin - a valid Employee token is rejected by the
/// [Authorize(Roles=...)] gate before the request ever reaches a service.
/// </summary>
public class RoleAuthorizationTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public RoleAuthorizationTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    public static IEnumerable<object[]> OwnerAdminOnlyEndpoints()
    {
        var id = Guid.NewGuid();
        yield return new object[] { HttpMethod.Delete, $"/api/invoice/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/job/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/customer/{id}" };
        yield return new object[] { HttpMethod.Get, $"/api/customer/export/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/lead/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/notes/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/property/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/customerphone/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/event/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/quote/{id}" };
        yield return new object[] { HttpMethod.Post, "/api/employee" };
        yield return new object[] { HttpMethod.Put, "/api/employee" };
        yield return new object[] { HttpMethod.Delete, $"/api/employee/{id}" };
        yield return new object[] { HttpMethod.Get, $"/api/employee/export/{id}" };
        yield return new object[] { HttpMethod.Post, "/api/service-item" };
        yield return new object[] { HttpMethod.Put, "/api/service-item" };
        yield return new object[] { HttpMethod.Delete, $"/api/service-item/{id}" };
        yield return new object[] { HttpMethod.Get, $"/api/service-item/export/{id}" };
        yield return new object[] { HttpMethod.Post, "/api/customfield" };
        yield return new object[] { HttpMethod.Put, "/api/customfield" };
        yield return new object[] { HttpMethod.Delete, $"/api/customfield/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/customfieldvalue/{id}" };
        yield return new object[] { HttpMethod.Put, "/api/workspace" };
    }

    [Theory]
    [MemberData(nameof(OwnerAdminOnlyEndpoints))]
    public async Task Employee_is_forbidden_from_owner_admin_only_endpoints(HttpMethod method, string path)
    {
        var client = AuthenticatedClient("Employee", Guid.NewGuid());

        var response = await client.SendAsync(new HttpRequestMessage(method, path));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    // A handful of the underlying services throw UnauthorizedAccessException (-> 403)
    // for a record that simply doesn't exist, not only for one in the wrong workspace -
    // pre-existing behavior unrelated to this role gate. Made-up ids there would make
    // this check indistinguishable from the role gate itself, so it sticks to the
    // endpoints where any status other than 401/403 unambiguously proves the gate let
    // an Owner through.
    public static IEnumerable<object[]> OwnerAdminOnlyEndpointsUnambiguousForOwner()
    {
        var id = Guid.NewGuid();
        yield return new object[] { HttpMethod.Delete, $"/api/invoice/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/job/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/lead/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/customerphone/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/event/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/quote/{id}" };
        yield return new object[] { HttpMethod.Post, "/api/employee" };
        yield return new object[] { HttpMethod.Put, "/api/employee" };
        yield return new object[] { HttpMethod.Post, "/api/service-item" };
        yield return new object[] { HttpMethod.Put, "/api/service-item" };
        yield return new object[] { HttpMethod.Delete, $"/api/service-item/{id}" };
        yield return new object[] { HttpMethod.Post, "/api/customfield" };
        yield return new object[] { HttpMethod.Put, "/api/customfield" };
        yield return new object[] { HttpMethod.Delete, $"/api/customfield/{id}" };
        yield return new object[] { HttpMethod.Delete, $"/api/customfieldvalue/{id}" };
        yield return new object[] { HttpMethod.Put, "/api/workspace" };
    }

    [Theory]
    [MemberData(nameof(OwnerAdminOnlyEndpointsUnambiguousForOwner))]
    public async Task Owner_clears_the_role_gate_on_owner_admin_only_endpoints(HttpMethod method, string path)
    {
        var client = AuthenticatedClient("Owner", Guid.NewGuid());

        var response = await client.SendAsync(new HttpRequestMessage(method, path));

        // Whatever happens past the gate (404 for a made-up id, a validation error for
        // an empty body) is irrelevant here - only that the role check itself did not
        // block an Owner the way it blocks an Employee above.
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private HttpClient AuthenticatedClient(string role, Guid workspaceId)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateToken(role, workspaceId));
        return client;
    }

    private string CreateToken(string role, Guid workspaceId)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, "Test User"),
            new(ClaimTypes.Email, "test@example.com"),
            new("workspaceId", workspaceId.ToString()),
            new(ClaimTypes.Role, role)
        };

        return _factory.CreateTestToken(claims);
    }
}
