using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace backend.Tests;

/// <summary>
/// ValidateIssuer/ValidateAudience were both false and nothing was set when
/// minting - a JWT signed with the same key (leaked, reused, or forged by some
/// other system that guessed/obtained it) would still validate as long as the
/// signature checked out. These pin that a token missing the expected
/// issuer/audience is rejected even though its signature is genuinely valid.
/// </summary>
public class JwtIssuerAudienceTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public JwtIssuerAudienceTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    private string SignTokenWithIssuerAudience(string? issuer, string? audience)
    {
        using var scope = _factory.Services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var signingKey = configuration["AppSettings:Token"]!;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim("workspaceId", Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, "Owner"),
            new Claim("token_type", "access"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        var token = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims, expires: DateTime.UtcNow.AddMinutes(5), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Fact]
    public async Task A_correctly_signed_token_with_the_wrong_issuer_is_rejected()
    {
        var client = _factory.CreateClient();
        var token = SignTokenWithIssuerAudience("SomeOtherSystem", "FieldSyncHub");

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task A_correctly_signed_token_with_the_wrong_audience_is_rejected()
    {
        var client = _factory.CreateClient();
        var token = SignTokenWithIssuerAudience("FieldSyncHub", "SomeOtherAudience");

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task A_correctly_signed_token_with_no_issuer_or_audience_at_all_is_rejected()
    {
        var client = _factory.CreateClient();
        var token = SignTokenWithIssuerAudience(null, null);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task A_token_with_the_correct_issuer_and_audience_still_authenticates()
    {
        var client = _factory.CreateClient();
        var token = SignTokenWithIssuerAudience("FieldSyncHub", "FieldSyncHub");

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
