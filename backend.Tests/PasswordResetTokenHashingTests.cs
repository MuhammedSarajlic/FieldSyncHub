using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using backend.Services.AuthService;
using backend.Services.EmailService;
using backend.Services.TokenService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// PasswordResetToken used to be stored in plaintext - a database read (backup,
/// leaked snapshot, SQL injection) handed over a live, usable reset link. Only a
/// SHA-256 hash is persisted now; the raw token exists only in the email. These pin
/// that the stored value can't be used as a token itself, that the real token still
/// works, and that a successful reset revokes every other session - a compromised
/// session must not survive the recovery that was supposed to end it.
/// </summary>
public class PasswordResetTokenHashingTests
{
    private static (AuthService authService, DataContext context, CapturingEmailService emails) CreateService()
    {
        var context = CreateContext();
        var configuration = new ConfigurationBuilder().Build();
        var tokenService = new TokenService(
            new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
            }).Build(),
            new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
            context);
        var emails = new CapturingEmailService();
        var authService = new AuthService(context, configuration, emails, tokenService, new MemoryCache(new MemoryCacheOptions()));
        return (authService, context, emails);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static string ExtractTokenFromEmail(string body)
    {
        var marker = "token=";
        var start = body.IndexOf(marker, StringComparison.Ordinal) + marker.Length;
        var end = body.IndexOfAny(['"', ' ', ')'], start);
        return end == -1 ? body[start..] : body[start..end];
    }

    [Fact]
    public async Task ForgotPassword_never_stores_the_raw_token()
    {
        var (authService, context, emails) = CreateService();
        var user = new User { Id = Guid.NewGuid(), Email = "user@acme.test", FirstName = "A", LastName = "B" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        await authService.ForgotPassword("user@acme.test");

        var reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        var rawToken = ExtractTokenFromEmail(emails.LastPlainTextBody!);

        Assert.NotEqual(rawToken, reloaded.PasswordResetToken);

        var expectedHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
        Assert.Equal(expectedHash, reloaded.PasswordResetToken);
    }

    [Fact]
    public async Task ResetPassword_succeeds_with_the_real_token_from_the_email()
    {
        var (authService, context, emails) = CreateService();
        var user = new User { Id = Guid.NewGuid(), Email = "user@acme.test", FirstName = "A", LastName = "B", PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword1") };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        await authService.ForgotPassword("user@acme.test");
        var rawToken = ExtractTokenFromEmail(emails.LastPlainTextBody!);

        var result = await authService.ResetPassword(rawToken, "NewPassword1");

        Assert.True(result.Success);
    }

    [Fact]
    public async Task ResetPassword_rejects_the_stored_hash_used_as_if_it_were_the_token()
    {
        // The exact scenario the hash defends against: someone who read the stored
        // value straight out of the database (rather than the email) must not be
        // able to use it as a working reset token.
        var (authService, context, emails) = CreateService();
        var user = new User { Id = Guid.NewGuid(), Email = "user@acme.test", FirstName = "A", LastName = "B" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        await authService.ForgotPassword("user@acme.test");
        var reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        var storedHash = reloaded.PasswordResetToken!;

        var result = await authService.ResetPassword(storedHash, "NewPassword1");

        Assert.False(result.Success);
    }

    [Fact]
    public async Task ResetPassword_revokes_every_outstanding_refresh_token()
    {
        var (authService, context, emails) = CreateService();
        var user = new User { Id = Guid.NewGuid(), Email = "user@acme.test", FirstName = "A", LastName = "B" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var tokenService = new TokenService(
            new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
            }).Build(),
            new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
            context);
        var (_, refreshToken) = await tokenService.GenerateTokensAsync(new backend.Dtos.UserDto.GetUserDto { Id = user.Id, Email = user.Email, FirstName = "A", LastName = "B" });

        await authService.ForgotPassword("user@acme.test");
        var rawToken = ExtractTokenFromEmail(emails.LastPlainTextBody!);
        await authService.ResetPassword(rawToken, "NewPassword1");

        Assert.Null(await tokenService.ValidateRefreshTokenAsync(refreshToken));
    }

    private sealed class CapturingEmailService : IEmailService
    {
        public string? LastPlainTextBody { get; private set; }
        public bool IsConfigured => true;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
        {
            LastPlainTextBody = plainTextContent;
            return Task.FromResult(EmailSendResult.Ok);
        }

        public Task<EmailSendResult> SendEmailAsync(
            IEnumerable<string> toEmails,
            string subject,
            string plainTextContent,
            string htmlContent,
            IEnumerable<EmailAttachment>? attachments = null)
        {
            LastPlainTextBody = plainTextContent;
            return Task.FromResult(EmailSendResult.Ok);
        }
    }
}
