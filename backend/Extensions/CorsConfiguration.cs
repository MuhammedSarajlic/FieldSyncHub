namespace backend.Extensions;

/// <summary>
/// CORS origins used to be hardcoded to http://localhost:5173, so no deployed
/// frontend could ever talk to the API. Derives the allowed origin(s) from
/// AppSettings:FrontendUrl instead - the same per-environment setting already used
/// to build links in emails - rather than a second setting that could drift out of
/// sync with it.
/// </summary>
public static class CorsConfiguration
{
    public static string[] ParseAllowedOrigins(string? frontendUrl)
        => (string.IsNullOrWhiteSpace(frontendUrl) ? "http://localhost:5173" : frontendUrl)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
