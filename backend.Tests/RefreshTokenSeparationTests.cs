using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace backend.Tests;

/// <summary>
/// TokenService used to mint access and refresh tokens with identical claims and no
/// server-side record at all: a stolen refresh cookie worked as a bearer token for up
/// to 30 days, an access token could be replayed into /api/auth/refresh, and neither
/// logout nor a password change could revoke anything since only the cookie was ever
/// cleared. These are end-to-end checks through the real HTTP pipeline (register,
/// refresh, logout) rather than unit tests, since the fix spans the JWT bearer
/// pipeline (Program.cs), token issuance (TokenService), and the refresh/logout
/// endpoints (AuthController/AuthService) together.
/// </summary>
public class RefreshTokenSeparationTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public RefreshTokenSeparationTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task A_refresh_token_cannot_authenticate_an_api_request()
    {
        var client = CreateClientWithoutCookieJar();
        var (accessToken, refreshToken) = await RegisterAndGetTokens(client);
        Assert.NotEmpty(accessToken);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", refreshToken);

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task An_access_token_cannot_be_used_at_the_refresh_endpoint()
    {
        var client = CreateClientWithoutCookieJar();
        var (accessToken, _) = await RegisterAndGetTokens(client);

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request.Headers.Add("Cookie", $"refreshToken={accessToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task A_genuine_access_token_still_authenticates_normally()
    {
        // Sanity check alongside the two rejection tests above - the type check
        // must reject the wrong type without also rejecting the right one.
        var client = CreateClientWithoutCookieJar();
        var (accessToken, _) = await RegisterAndGetTokens(client);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Refreshing_rotates_the_token_so_the_old_one_stops_working()
    {
        var client = CreateClientWithoutCookieJar();
        var (_, refreshToken) = await RegisterAndGetTokens(client);

        var first = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        first.Headers.Add("Cookie", $"refreshToken={refreshToken}");
        var firstResponse = await client.SendAsync(first);
        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);

        // Replay the same (now-rotated) refresh token - a copy captured in transit
        // must not still work after the legitimate client already used it.
        var replay = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        replay.Headers.Add("Cookie", $"refreshToken={refreshToken}");
        var replayResponse = await client.SendAsync(replay);

        Assert.Equal(HttpStatusCode.Unauthorized, replayResponse.StatusCode);
    }

    [Fact]
    public async Task Logout_revokes_the_refresh_token_not_just_the_cookie()
    {
        var client = CreateClientWithoutCookieJar();
        var (accessToken, refreshToken) = await RegisterAndGetTokens(client);

        // Logout requires an authenticated caller (the global secure-by-default
        // AuthorizeFilter) - the access token is what proves that, separately from
        // the refresh cookie being revoked.
        var logout = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
        logout.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        logout.Headers.Add("Cookie", $"refreshToken={refreshToken}");
        var logoutResponse = await client.SendAsync(logout);
        Assert.Equal(HttpStatusCode.OK, logoutResponse.StatusCode);

        // The same JWT is still cryptographically valid and unexpired - only the
        // server-side record makes it useless after logout.
        var afterLogout = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        afterLogout.Headers.Add("Cookie", $"refreshToken={refreshToken}");
        var afterLogoutResponse = await client.SendAsync(afterLogout);

        Assert.Equal(HttpStatusCode.Unauthorized, afterLogoutResponse.StatusCode);
    }

    private HttpClient CreateClientWithoutCookieJar()
        // CreateClient() wires up an automatic cookie container by default, which
        // would silently override or merge with the Cookie headers these tests set
        // by hand to control exactly which refresh token is presented.
        => _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

    private async Task<(string accessToken, string refreshToken)> RegisterAndGetTokens(HttpClient client)
    {
        var email = $"{Guid.NewGuid()}@example.com";
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Test",
            lastName = "User",
            email,
            password = "Password1"
        });
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var accessToken = body.GetProperty("accessToken").GetString()!;

        var setCookie = response.Headers.GetValues("Set-Cookie").First(c => c.StartsWith("refreshToken="));
        var refreshToken = setCookie.Split(';')[0]["refreshToken=".Length..];

        return (accessToken, refreshToken);
    }
}
