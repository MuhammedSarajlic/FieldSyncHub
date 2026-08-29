using backend.Data;
using backend.Dtos.UserDto;
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
/// Login had no lockout or backoff at all - an attacker could spray password
/// guesses at one account as fast as the network allowed, from as many source IPs
/// as they liked, and the IP-partitioned "auth" rate limiter (Program.cs) can't stop
/// that on its own since it only sees one IP at a time. AuthService now tracks
/// failures per account in-memory and, past a small free allowance, requires an
/// exponentially growing wait before the next attempt is even evaluated.
/// </summary>
public class LoginLockoutTests
{
    private static (AuthService authService, DataContext context) CreateService()
    {
        var context = CreateContext();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
            })
            .Build();
        var tokenService = new TokenService(configuration, new HttpContextAccessor { HttpContext = new DefaultHttpContext() }, context);
        var authService = new AuthService(context, configuration, new NoopEmailService(), tokenService, new MemoryCache(new MemoryCacheOptions()));
        return (authService, context);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static async Task SeedUser(DataContext context, string email, string password)
    {
        context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = "A",
            LastName = "B",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12))
        });
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task A_handful_of_wrong_passwords_are_not_locked_out()
    {
        var (authService, context) = CreateService();
        await SeedUser(context, "user@acme.test", "CorrectPassword1");

        for (var i = 0; i < 5; i++)
        {
            var result = await authService.Login(new UserLoginDto { Email = "user@acme.test", Password = "WrongPassword" });
            Assert.False(result.Success);
            Assert.Equal("Invalid email or password", result.ErrorMessage);
        }
    }

    [Fact]
    public async Task Repeated_failures_past_the_free_allowance_lock_the_account()
    {
        var (authService, context) = CreateService();
        await SeedUser(context, "user@acme.test", "CorrectPassword1");

        // 6 failures trips the lockout (5 free + 1 over); the 7th call must be
        // rejected before it even looks at the password.
        for (var i = 0; i < 6; i++)
        {
            await authService.Login(new UserLoginDto { Email = "user@acme.test", Password = "WrongPassword" });
        }

        var ex = await Assert.ThrowsAsync<AccountLockedException>(
            () => authService.Login(new UserLoginDto { Email = "user@acme.test", Password = "CorrectPassword1" }));

        Assert.True(ex.RetryAfter > TimeSpan.Zero);
    }

    [Fact]
    public async Task A_successful_login_clears_the_failure_count()
    {
        var (authService, context) = CreateService();
        await SeedUser(context, "user@acme.test", "CorrectPassword1");

        for (var i = 0; i < 3; i++)
        {
            await authService.Login(new UserLoginDto { Email = "user@acme.test", Password = "WrongPassword" });
        }

        var success = await authService.Login(new UserLoginDto { Email = "user@acme.test", Password = "CorrectPassword1" });
        Assert.True(success.Success);

        // Should be back to a clean slate - another 5 failures must not lock it out.
        for (var i = 0; i < 5; i++)
        {
            var result = await authService.Login(new UserLoginDto { Email = "user@acme.test", Password = "WrongPassword" });
            Assert.False(result.Success);
        }
    }

    [Fact]
    public async Task Lockout_is_scoped_to_the_targeted_account_only()
    {
        var (authService, context) = CreateService();
        await SeedUser(context, "victim@acme.test", "CorrectPassword1");
        await SeedUser(context, "bystander@acme.test", "CorrectPassword2");

        for (var i = 0; i < 6; i++)
        {
            await authService.Login(new UserLoginDto { Email = "victim@acme.test", Password = "WrongPassword" });
        }

        // The victim account is locked, but a different account must be unaffected.
        var bystanderResult = await authService.Login(new UserLoginDto { Email = "bystander@acme.test", Password = "CorrectPassword2" });
        Assert.True(bystanderResult.Success);
    }

    private sealed class NoopEmailService : IEmailService
    {
        public bool IsConfigured => false;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => Task.FromResult(EmailSendResult.Ok);

        public Task<EmailSendResult> SendEmailAsync(
            IEnumerable<string> toEmails,
            string subject,
            string plainTextContent,
            string htmlContent,
            IEnumerable<EmailAttachment>? attachments = null)
            => Task.FromResult(EmailSendResult.Ok);
    }
}
