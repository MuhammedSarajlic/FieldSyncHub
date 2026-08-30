using System.Net;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests;

/// <summary>
/// Guards the "secure by default" authorization posture: every controller action must
/// require a token unless it is explicitly named in <see cref="AllowAnonymousEndpoints"/>.
/// Adding a new controller/action without [AllowAnonymous] should pass automatically;
/// adding one that skips auth must be a deliberate addition to the allow-list below.
/// </summary>
public class ControllerAuthorizationDefaultsTests : IClassFixture<AuthorizationDefaultsFactory>
{
    private static readonly HashSet<(string Method, string Template)> AllowAnonymousEndpoints = new()
    {
        ("POST", "api/auth/login"),
        ("POST", "api/auth/register"),
        ("POST", "api/auth/google"),
        ("POST", "api/auth/forgot-password"),
        ("POST", "api/auth/reset-password"),
        ("POST", "api/auth/refresh"),
        ("POST", "api/auth/2fa/challenge"),
        ("POST", "api/invite/accept-invite"),
        ("GET", "api/invite/validate-token"),
        ("POST", "api/user/confirm-email-change"),
        ("POST", "api/payments/stripe/webhook"),
        ("GET", "api/portal/{token}"),
        ("POST", "api/portal/{token}/approve"),
        ("POST", "api/portal/{token}/payment-intent"),
        ("POST", "api/booking/{workspaceId:guid}"),
        ("GET", "api/review/{token}"),
        ("POST", "api/review/{token}"),
        ("GET", "api/marketing/campaigns/{campaignId:guid}/track/{recipientId:guid}"),
        ("GET", "api/integrations/accounting/callback/{provider}"),
        ("GET", "api/public/v1/customers"),
        ("GET", "api/public/v1/invoices"),
        ("POST", "api/public/v1/webhooks/subscribe"),
        ("DELETE", "api/public/v1/webhooks/subscribe/{id:guid}"),
    };

    private readonly AuthorizationDefaultsFactory _factory;

    public ControllerAuthorizationDefaultsTests(AuthorizationDefaultsFactory factory)
    {
        _factory = factory;
    }

    public static IEnumerable<object[]> MappedEndpoints()
    {
        using var factory = new AuthorizationDefaultsFactory();
        using var scope = factory.Services.CreateScope();
        var provider = scope.ServiceProvider.GetRequiredService<IActionDescriptorCollectionProvider>();

        foreach (var action in provider.ActionDescriptors.Items.OfType<ControllerActionDescriptor>())
        {
            var template = action.AttributeRouteInfo?.Template;
            if (template == null)
            {
                continue;
            }

            var methods = action.ActionConstraints?
                .OfType<Microsoft.AspNetCore.Mvc.ActionConstraints.HttpMethodActionConstraint>()
                .SelectMany(c => c.HttpMethods)
                .Distinct()
                .ToList();

            // An action with no explicit [Http*] constraint (rare in this codebase)
            // defaults to GET, matching ASP.NET Core's own routing behavior.
            if (methods == null || methods.Count == 0)
            {
                methods = ["GET"];
            }

            foreach (var method in methods)
            {
                yield return new object[] { method, template };
            }
        }
    }

    [Theory]
    [MemberData(nameof(MappedEndpoints))]
    public async Task Endpoint_without_token_is_rejected_unless_allow_listed(string method, string template)
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(new HttpMethod(method), ResolveRoute(template));

        var response = await client.SendAsync(request);

        // The [Authorize] pipeline rejecting a request produces a 401 *with* a
        // WWW-Authenticate challenge header. An allow-listed action is free to also
        // return 401 from its own business logic (e.g. refresh with no valid cookie);
        // what must never happen is the auth filter itself blocking the request.
        var blockedByAuthFilter = response.StatusCode == HttpStatusCode.Unauthorized
            && response.Headers.WwwAuthenticate.Any();

        var isAllowListed = AllowAnonymousEndpoints.Contains((method, template));
        if (isAllowListed)
        {
            Assert.False(
                blockedByAuthFilter,
                $"{method} {template} is on the allow-list but was still rejected by the " +
                "authorization filter (401 with a WWW-Authenticate challenge).");
        }
        else
        {
            Assert.True(
                blockedByAuthFilter,
                $"{method} {template} returned {(int)response.StatusCode} without a token; " +
                "expected a 401 challenge since it is not in the AllowAnonymousEndpoints allow-list.");
        }
    }

    [Fact]
    public void AllowAnonymousEndpoints_are_all_still_mapped()
    {
        var mapped = MappedEndpoints()
            .Select(args => ((string)args[0], (string)args[1]))
            .ToHashSet();

        foreach (var endpoint in AllowAnonymousEndpoints)
        {
            Assert.Contains(endpoint, mapped);
        }
    }

    private static string ResolveRoute(string template)
    {
        return Regex.Replace(template, "{([^}]+)}", match =>
        {
            var token = match.Groups[1].Value;
            return token.Contains(":guid", StringComparison.OrdinalIgnoreCase)
                ? Guid.NewGuid().ToString()
                : token.Contains(":int", StringComparison.OrdinalIgnoreCase)
                    ? "1"
                    : "placeholder";
        });
    }
}
