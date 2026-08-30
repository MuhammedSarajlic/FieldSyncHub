using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using backend.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using backend.Dtos.QuoteDto;
using backend.Models.QuoteModels;
using Mapster;
using backend.Dtos.LineItemDto;
using backend.Models;
using QuestPDF.Infrastructure;
using Microsoft.AspNetCore.Mvc.Authorization;
using backend.Filters;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using backend.Services.TokenService;
using backend.Services.Operations;
using backend.Health;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using backend.Middleware;
using backend.Response;
using backend.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options => options.IncludeScopes = true);

QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddDbContext<DataContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("WebApiDatabase"),
        new MySqlServerVersion(new Version(8, 0, 36))
    ));

var allowedOrigins = CorsConfiguration.ParseAllowedOrigins(builder.Configuration["AppSettings:FrontendUrl"]);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", cf =>
    {
        cf.WithOrigins(allowedOrigins)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
builder.Services.AddService(builder.Configuration);
builder.Services.AddControllersWithViews(options =>
    {
        // Secure by default: every controller/action requires an authenticated
        // user unless explicitly opted out with [AllowAnonymous].
        options.Filters.Add(new AuthorizeFilter());
        // Any {workspaceId} route segment must match the caller's own workspace
        // claim - otherwise [Authorize] alone still lets one workspace read another's
        // data by changing the GUID in the URL.
        options.Filters.Add(typeof(WorkspaceAccessFilter));
        options.Filters.Add<FluentValidationFilter>();
        options.Filters.Add<PaginationFilter>();
    })
    .AddJsonOptions(options =>
    {
        // EF Core's change-tracker fixup can link entities back to each other
        // (e.g. a loaded User <-> its Workspace's Users collection) even when
        // no query explicitly asked for both sides - ignore those cycles
        // instead of failing serialization on whichever response hits them first.
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddValidatorsFromAssemblyContaining<CreateJobDtoValidator>();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value!.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? error.Exception?.Message ?? "The value is invalid."
                        : error.ErrorMessage)
                    .ToArray());

        return new BadRequestObjectResult(new ApiResponse<object>
        {
            Success = false,
            ErrorMessage = "One or more validation errors occurred.",
            Payload = errors
        });
    };
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // Invite-sending is scoped per caller (not per IP) so one busy workspace can't
    // exhaust the limit for another, and capped low since it's an anyone-in-workspace
    // action that can otherwise be used to spam arbitrary email addresses.
    options.AddPolicy("invite", httpContext =>
    {
        var callerId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? httpContext.Connection.RemoteIpAddress?.ToString()
            ?? "anonymous";
        return RateLimitPartition.GetFixedWindowLimiter(callerId, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
    // Customer/quote emails go out from the workspace's verified sending domain -
    // partition by workspace (not caller) so the cap holds regardless of which
    // teammate is sending, and can't be bypassed by spreading requests across users.
    options.AddPolicy("email-relay", httpContext =>
    {
        var workspaceId = httpContext.User.FindFirst("workspaceId")?.Value
            ?? httpContext.Connection.RemoteIpAddress?.ToString()
            ?? "anonymous";
        return RateLimitPartition.GetFixedWindowLimiter(workspaceId, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
    // Login/register/google/refresh/reset-password/accept-invite are all anonymous,
    // so the caller has no account or workspace claim yet to partition by - IP is
    // the only thing available at this layer. AuthService.Login separately tracks
    // failures per account (see LoginFailureState) to cover the case this can't:
    // one attacker spraying guesses at a single account from many source IPs.
    options.AddPolicy("auth", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(ip, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 15,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 3,
            QueueLimit = 0
        });
    });
    // forgot-password's own response is identical whether or not anything actually
    // happens (see AuthService.ForgotPassword's per-address cooldown), but that
    // cooldown only stops emails going out - without this, the endpoint itself could
    // still be hit at line rate. Tighter and longer-windowed than "auth" since
    // there's no legitimate reason to call it often.
    options.AddPolicy("forgot-password", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(15),
            QueueLimit = 0
        });
    });
});
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
});
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("quote-logo", client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
});
builder.Services.AddHttpClient("geocoding", client =>
{
    client.Timeout = TimeSpan.FromSeconds(3);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("FieldSyncHub/1.0 (+https://fieldsynchub.com)");
});
builder.Services.AddHostedService<JobNotificationWorker>();
builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
TypeAdapterConfig<UpdateQuoteDto, Quote>.NewConfig()
    .IgnoreNullValues(true);
TypeAdapterConfig<UpdateLineItemDto, LineItem>.NewConfig()
    .IgnoreNullValues(true);
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
});

// The JWT signing key must come from configuration (environment variable
// AppSettings__Token in production/docker, appsettings.json - gitignored, see
// appsettings.example.json - locally) and be long enough for HMAC-SHA512. Never
// fall back to a default: a missing key must fail startup loudly, not silently
// sign tokens with a guessable value.
var jwtSigningKey = builder.Configuration["AppSettings:Token"];
if (string.IsNullOrWhiteSpace(jwtSigningKey) || Encoding.UTF8.GetByteCount(jwtSigningKey) < 64)
{
    throw new InvalidOperationException(
        "AppSettings:Token (JWT signing key) is missing or shorter than the 64 bytes " +
        "HMAC-SHA512 requires. Set it via the AppSettings__Token environment variable, " +
        "or in a local (gitignored) backend/appsettings.json - see appsettings.example.json.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            // A token signed with the same key but minted by some other system (or
            // under a stale/reused key) is rejected on the issuer/audience mismatch
            // alone, even before anything else about it is inspected.
            ValidateIssuer = true,
            ValidIssuer = JwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = JwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            // Access and refresh tokens share a signing key and claim shape, so
            // signature/expiry validation alone can't tell them apart - a stolen
            // refresh cookie would otherwise work as a bearer token for up to 30
            // days. Every token minted by TokenService carries a token_type claim;
            // only "access" may authenticate an API request.
            OnTokenValidated = context =>
            {
                var tokenType = context.Principal?.FindFirst("token_type")?.Value;
                if (tokenType != "access")
                {
                    context.Fail("This token cannot be used to authenticate API requests.");
                }
                return Task.CompletedTask;
            }
        };
    });


var app = builder.Build();

app.UseMiddleware<RequestCorrelationMiddleware>();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = feature?.Error;
        var correlationId = context.TraceIdentifier;
        var statusCode = exception switch
        {
            KeyNotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status403Forbidden,
            ArgumentException or InvalidOperationException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("GlobalExceptionHandler");
        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception for {Path}", feature?.Path);
        }
        else
        {
            logger.LogWarning(exception, "Request failed for {Path} with status {StatusCode}", feature?.Path, statusCode);
        }

        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        var errorMessage = statusCode >= StatusCodes.Status500InternalServerError
            ? $"An unexpected error occurred. Correlation ID: {correlationId}"
            : exception?.Message ?? "The request could not be completed.";

        await context.Response.WriteAsJsonAsync(new ApiResponse<object>
        {
            Success = false,
            ErrorMessage = errorMessage,
            Payload = null
        });
    });
});

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseSecurityHeaders(app.Environment);
app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    });
}

app.MapStaticAssets();

app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => false
}).AllowAnonymous();
app.MapHealthChecks("/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
}).AllowAnonymous();

app.Run();

public partial class Program { }
