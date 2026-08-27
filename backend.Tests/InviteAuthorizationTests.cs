using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace backend.Tests;

/// <summary>
/// POST /api/invite/send-invite used to take an arbitrary email and workspaceId with
/// no caller check at all - anyone, logged in or not, could plant an account in any
/// workspace. These tests pin the fix: the endpoint requires an authenticated
/// Owner/Admin, and an Employee (a valid token, just the wrong role) is rejected too.
/// </summary>
public class InviteAuthorizationTests : IClassFixture<AuthorizationDefaultsFactory>
{
    // Matches AppSettings:Token in backend/appsettings.json, which the test host loads as-is.
    private const string SigningKey = "6niNItCw45h6QmxkFUvy9tTVRea17jDk5IDT6LbgIy9oTf5pA0Jj5ipgePKm6bLhnBMNxw4tJpyhvkfE";

    private readonly AuthorizationDefaultsFactory _factory;

    public InviteAuthorizationTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SendInvite_without_a_token_is_unauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync(
            $"/api/invite/send-invite?email=someone@example.com", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SendInvite_as_an_employee_is_forbidden()
    {
        var client = AuthenticatedClient("Employee", Guid.NewGuid());

        var response = await client.PostAsync(
            $"/api/invite/send-invite?email=someone@example.com", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SendInvite_bulk_without_a_token_is_unauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonEmails(
            "/api/invite/send-invite/bulk", new[] { "someone@example.com" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SendInvite_bulk_as_an_employee_is_forbidden()
    {
        var client = AuthenticatedClient("Employee", Guid.NewGuid());

        var response = await client.PostAsJsonEmails(
            "/api/invite/send-invite/bulk", new[] { "someone@example.com" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SendInvite_bulk_over_the_cap_is_rejected()
    {
        // Each bulk request costs one rate-limit permit but used to loop an unbounded
        // Emails list - 10 req/min x N emails. The list itself must be capped.
        var client = AuthenticatedClient("Owner", Guid.NewGuid());
        var emails = Enumerable.Range(0, 11).Select(i => $"person{i}@example.com").ToArray();

        var response = await client.PostAsJsonEmails("/api/invite/send-invite/bulk", emails);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Admin_inviting_as_owner_is_forbidden()
    {
        var client = AuthenticatedClient("Admin", Guid.NewGuid());

        var response = await client.PostAsync(
            $"/api/invite/send-invite?email=someone@example.com&role=Owner", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private HttpClient AuthenticatedClient(string role, Guid workspaceId)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateToken(role, workspaceId));
        return client;
    }

    private static string CreateToken(string role, Guid workspaceId)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, "Test User"),
            new(ClaimTypes.Email, "test@example.com"),
            new("workspaceId", workspaceId.ToString()),
            new(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddMinutes(5), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

internal static class HttpClientJsonExtensions
{
    public static Task<HttpResponseMessage> PostAsJsonEmails(this HttpClient client, string url, string[] emails)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(new { emails });
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return client.PostAsync(url, content);
    }
}
