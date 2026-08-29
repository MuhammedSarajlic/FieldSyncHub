using System.Net;
using System.Net.Http.Json;

namespace backend.Tests;

/// <summary>
/// Login/register/etc had no rate limiting at all - Program.cs now applies an
/// IP-partitioned "auth" policy (15 requests/minute) to them, and a tighter
/// "forgot-password" policy (5/15min) to forgot-password specifically, since that one
/// doubles as a mail-bombing vector. These pin that hammering either endpoint past its
/// limit gets a 429, not just a stream of normal error responses an attacker could
/// keep sending forever.
/// </summary>
public class AuthRateLimitTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private readonly AuthorizationDefaultsFactory _factory;

    public AuthRateLimitTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Hammering_login_past_the_limit_gets_rate_limited()
    {
        var client = _factory.CreateClient();
        HttpStatusCode? sawTooManyRequests = null;

        for (var i = 0; i < 20; i++)
        {
            var response = await client.PostAsJsonAsync("/api/auth/login", new
            {
                email = $"nobody{i}@example.com",
                password = "WrongPassword1"
            });

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                sawTooManyRequests = response.StatusCode;
                break;
            }
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, sawTooManyRequests);
    }

    [Fact]
    public async Task Hammering_forgot_password_past_its_tighter_limit_gets_rate_limited()
    {
        var client = _factory.CreateClient();
        HttpStatusCode? sawTooManyRequests = null;

        for (var i = 0; i < 10; i++)
        {
            var response = await client.PostAsJsonAsync("/api/auth/forgot-password", new
            {
                email = $"nobody{i}@example.com"
            });

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                sawTooManyRequests = response.StatusCode;
                break;
            }
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, sawTooManyRequests);
    }
}
