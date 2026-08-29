namespace backend.Extensions;

/// <summary>
/// The frontend keeps its access token in localStorage (not an HttpOnly cookie),
/// so any successful XSS there is a full account takeover - there's no cookie
/// jail keeping the token out of reach of injected script. A CSP can't fix an XSS
/// bug, but it's the cheapest available mitigation: it stops injected script from
/// phoning home to an attacker's origin even if it does run. Also adds the other
/// header hygiene a security review checks for regardless of whether this
/// particular API serves HTML: nosniff, a conservative Referrer-Policy, and
/// frame-ancestors to block clickjacking on whatever HTML this server does serve
/// (Swagger UI, the exception handler's error page).
/// </summary>
public static class SecurityHeaders
{
    // Swagger UI (dev-only, see Program.cs) is self-hosted from this same origin
    // but uses inline <script>/<style> - 'unsafe-inline' only, never a wildcard or
    // an external host, so real app responses are still meaningfully protected in
    // the same request pipeline instance dev runs against.
    private const string DevelopmentPolicy =
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'";

    // A pure JSON API has no first-party page of its own to allow anything for.
    private const string ProductionPolicy = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";

    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app, IWebHostEnvironment environment)
    {
        var csp = environment.IsDevelopment() ? DevelopmentPolicy : ProductionPolicy;

        return app.Use(async (context, next) =>
        {
            var headers = context.Response.Headers;
            headers["Content-Security-Policy"] = csp;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            headers["X-Frame-Options"] = "DENY";
            await next();
        });
    }
}
