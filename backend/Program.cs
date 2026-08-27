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

// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddJwtBearer(options =>
//     {
//         options.TokenValidationParameters = new TokenValidationParameters
//         {
//             ValidateIssuer = false,
//             ValidateAudience = false,
//             ValidateLifetime = true,
//             ValidateIssuerSigningKey = true,
//             IssuerSigningKey = new SymmetricSecurityKey(
//                 Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "your_super_secret_key_here")
//             ),

//             // This is what makes `ClaimTypes.NameIdentifier` work!
//             NameClaimType = ClaimTypes.NameIdentifier,
//             RoleClaimType = ClaimTypes.Role
//         };
//     });

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value ?? "Error")),
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
