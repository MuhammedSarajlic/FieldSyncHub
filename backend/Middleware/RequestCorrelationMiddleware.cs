using System.Diagnostics;

namespace backend.Middleware;

public sealed class RequestCorrelationMiddleware(
    RequestDelegate next,
    ILogger<RequestCorrelationMiddleware> logger)
{
    private const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = GetCorrelationId(context.Request.Headers[HeaderName].FirstOrDefault());
        context.TraceIdentifier = correlationId;
        context.Response.Headers[HeaderName] = correlationId;

        using (logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["RequestPath"] = context.Request.Path.ToString(),
            ["RequestMethod"] = context.Request.Method
        }))
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                await next(context);
            }
            finally
            {
                logger.LogInformation(
                    "HTTP {RequestMethod} {RequestPath} returned {StatusCode} in {ElapsedMilliseconds} ms",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds);
            }
        }
    }

    private static string GetCorrelationId(string? supplied)
    {
        if (!string.IsNullOrWhiteSpace(supplied)
            && supplied.Length <= 100
            && supplied.All(character => char.IsLetterOrDigit(character) || character is '-' or '_' or '.'))
        {
            return supplied;
        }

        return Guid.NewGuid().ToString("N");
    }
}
