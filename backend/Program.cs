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

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddDbContext<DataContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("WebApiDatabase"),
        new MySqlServerVersion(new Version(8, 0, 36))
    ));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", cf =>
    {
        cf.WithOrigins("http://localhost:5173")
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
    })
    .AddJsonOptions(options =>
    {
        // EF Core's change-tracker fixup can link entities back to each other
        // (e.g. a loaded User <-> its Workspace's Users collection) even when
        // no query explicitly asked for both sides - ignore those cycles
        // instead of failing serialization on whichever response hits them first.
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
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
});
builder.Services.AddHttpClient();
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
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });


var app = builder.Build();

if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<DataContext>();
    await db.Database.MigrateAsync();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
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

app.Run();

public partial class Program { }
