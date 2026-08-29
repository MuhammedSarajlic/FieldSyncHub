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
/// forgot-password had no per-address throttling, so it could be used to mail-bomb a
/// victim's inbox by repeatedly requesting a reset for their address. AuthService now
/// only actually issues a token and sends an email for the first request per address
/// within a cooldown window - every request in between gets the same generic success
/// response (so this still can't be used to enumerate accounts, or to detect that the
/// cooldown even exists) but produces no further email.
/// </summary>
public class ForgotPasswordCooldownTests
{
    private static (AuthService authService, DataContext context, CountingEmailService emails) CreateService()
    {
        var context = CreateContext();
        var configuration = new ConfigurationBuilder().Build();
        var tokenService = new TokenService(configuration, new HttpContextAccessor { HttpContext = new DefaultHttpContext() }, context);
        var emails = new CountingEmailService();
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

    [Fact]
    public async Task Repeated_requests_for_the_same_address_only_send_one_email()
    {
        var (authService, context, emails) = CreateService();
        context.Users.Add(new User { Id = Guid.NewGuid(), Email = "victim@acme.test", FirstName = "V", LastName = "I" });
        await context.SaveChangesAsync();

        for (var i = 0; i < 5; i++)
        {
            var result = await authService.ForgotPassword("victim@acme.test");
            Assert.True(result.Success);
            Assert.Equal("If an account with that email exists, a password reset link has been sent.", result.Payload);
        }

        Assert.Equal(1, emails.SendCount);
    }

    [Fact]
    public async Task The_cooldown_is_scoped_to_one_address()
    {
        var (authService, context, emails) = CreateService();
        context.Users.Add(new User { Id = Guid.NewGuid(), Email = "victim@acme.test", FirstName = "V", LastName = "I" });
        context.Users.Add(new User { Id = Guid.NewGuid(), Email = "other@acme.test", FirstName = "O", LastName = "T" });
        await context.SaveChangesAsync();

        await authService.ForgotPassword("victim@acme.test");
        await authService.ForgotPassword("victim@acme.test");
        await authService.ForgotPassword("other@acme.test");

        Assert.Equal(2, emails.SendCount);
    }

    private sealed class CountingEmailService : IEmailService
    {
        public int SendCount { get; private set; }
        public bool IsConfigured => true;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
        {
            SendCount++;
            return Task.FromResult(EmailSendResult.Ok);
        }

        public Task<EmailSendResult> SendEmailAsync(
            IEnumerable<string> toEmails,
            string subject,
            string plainTextContent,
            string htmlContent,
            IEnumerable<EmailAttachment>? attachments = null)
        {
            SendCount++;
            return Task.FromResult(EmailSendResult.Ok);
        }
    }
}
