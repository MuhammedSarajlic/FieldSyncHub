using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace backend.Tests;

/// <summary>
/// End-to-end coverage through the real HTTP pipeline: a password-only login for an
/// account with 2FA enabled must not hand out real tokens, and the challenge
/// endpoint - not the login endpoint - is what actually completes it.
/// </summary>
public class TwoFactorLoginFlowTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public TwoFactorLoginFlowTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient() => _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

    private async Task<(HttpClient client, string email, string password, string accessToken)> RegisterAndLogin()
    {
        var client = CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        const string password = "Password1";

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Test",
            lastName = "Owner",
            email,
            password
        });
        registerResponse.EnsureSuccessStatusCode();
        var registerBody = await registerResponse.Content.ReadFromJsonAsync<JsonElement>();
        var accessToken = registerBody.GetProperty("accessToken").GetString()!;

        return (client, email, password, accessToken);
    }

    private async Task<string> EnableTwoFactor(HttpClient client, string accessToken)
    {
        var setupRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/2fa/setup");
        setupRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var setupResponse = await client.SendAsync(setupRequest);
        setupResponse.EnsureSuccessStatusCode();
        var setupBody = await setupResponse.Content.ReadFromJsonAsync<JsonElement>();
        var secret = setupBody.GetProperty("manualEntryKey").GetString()!;

        var confirmRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/2fa/setup/confirm");
        confirmRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        confirmRequest.Content = JsonContent.Create(new { code = TotpTestHelper.GenerateCode(secret, DateTimeOffset.UtcNow) });
        var confirmResponse = await client.SendAsync(confirmRequest);
        confirmResponse.EnsureSuccessStatusCode();

        return secret;
    }

    [Fact]
    public async Task Login_for_an_account_without_2fa_returns_real_tokens_directly()
    {
        var (client, email, password, _) = await RegisterAndLogin();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var body = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();

        Assert.True(body.TryGetProperty("accessToken", out _));
        Assert.False(body.TryGetProperty("mfaRequired", out _));
    }

    [Fact]
    public async Task Login_for_an_account_with_2fa_enabled_returns_a_challenge_instead_of_tokens()
    {
        var (client, email, password, accessToken) = await RegisterAndLogin();
        await EnableTwoFactor(client, accessToken);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var body = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();

        Assert.True(body.GetProperty("mfaRequired").GetBoolean());
        Assert.False(body.TryGetProperty("accessToken", out _));
        Assert.True(body.TryGetProperty("challengeToken", out _));
    }

    [Fact]
    public async Task Challenge_with_the_correct_totp_code_issues_real_tokens()
    {
        var (client, email, password, accessToken) = await RegisterAndLogin();
        var secret = await EnableTwoFactor(client, accessToken);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var challengeToken = loginBody.GetProperty("challengeToken").GetString()!;

        var challengeResponse = await client.PostAsJsonAsync("/api/auth/2fa/challenge", new
        {
            challengeToken,
            code = TotpTestHelper.GenerateCode(secret, DateTimeOffset.UtcNow)
        });
        var challengeBody = await challengeResponse.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.OK, challengeResponse.StatusCode);
        Assert.True(challengeBody.TryGetProperty("accessToken", out _));
    }

    [Fact]
    public async Task Challenge_with_the_wrong_code_does_not_issue_tokens()
    {
        var (client, email, password, accessToken) = await RegisterAndLogin();
        await EnableTwoFactor(client, accessToken);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var challengeToken = loginBody.GetProperty("challengeToken").GetString()!;

        var challengeResponse = await client.PostAsJsonAsync("/api/auth/2fa/challenge", new
        {
            challengeToken,
            code = "000000"
        });

        Assert.Equal(HttpStatusCode.BadRequest, challengeResponse.StatusCode);
    }

    [Fact]
    public async Task The_access_token_from_a_completed_challenge_actually_authenticates()
    {
        var (client, email, password, accessToken) = await RegisterAndLogin();
        var secret = await EnableTwoFactor(client, accessToken);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var challengeToken = loginBody.GetProperty("challengeToken").GetString()!;

        var challengeResponse = await client.PostAsJsonAsync("/api/auth/2fa/challenge", new
        {
            challengeToken,
            code = TotpTestHelper.GenerateCode(secret, DateTimeOffset.UtcNow)
        });
        var challengeBody = await challengeResponse.Content.ReadFromJsonAsync<JsonElement>();
        var newAccessToken = challengeBody.GetProperty("accessToken").GetString()!;

        var meRequest = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        meRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", newAccessToken);
        var meResponse = await client.SendAsync(meRequest);

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
    }

    [Fact]
    public async Task A_challenge_token_cannot_be_used_to_authenticate_an_api_request_directly()
    {
        var (client, email, password, accessToken) = await RegisterAndLogin();
        await EnableTwoFactor(client, accessToken);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var challengeToken = loginBody.GetProperty("challengeToken").GetString()!;

        var meRequest = new HttpRequestMessage(HttpMethod.Get, "/api/user/me");
        meRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", challengeToken);
        var meResponse = await client.SendAsync(meRequest);

        Assert.Equal(HttpStatusCode.Unauthorized, meResponse.StatusCode);
    }
}
