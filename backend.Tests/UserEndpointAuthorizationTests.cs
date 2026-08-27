using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace backend.Tests;

/// <summary>
/// DELETE /api/user/{id} used to remove any account with no auth check at all. This
/// pins that it now requires an authenticated Owner - an Admin or Employee token
/// (a valid token, just the wrong role) is rejected before the delete ever runs.
/// </summary>
public class UserEndpointAuthorizationTests : IClassFixture<AuthorizationDefaultsFactory>
{
    // Matches AppSettings:Token in backend/appsettings.json, which the test host loads as-is.
    private const string SigningKey = "6niNItCw45h6QmxkFUvy9tTVRea17jDk5IDT6LbgIy9oTf5pA0Jj5ipgePKm6bLhnBMNxw4tJpyhvkfE";

    private readonly AuthorizationDefaultsFactory _factory;

    public UserEndpointAuthorizationTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task DeleteUser_without_a_token_is_unauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.DeleteAsync($"/api/user/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("Employee")]
    public async Task DeleteUser_as_a_non_owner_is_forbidden(string role)
    {
        var client = AuthenticatedClient(role, Guid.NewGuid());

        var response = await client.DeleteAsync($"/api/user/{Guid.NewGuid()}");

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
