using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.AuthService;
using backend.Services.EmailService;
using backend.Services.TokenService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// Passwords used to be hashed with BCrypt.GenerateSalt(6) - 64 rounds, roughly a
/// thousand times faster to brute-force than the modern work factor of 12. New
/// hashes must use the stronger factor, and a successful login is the only place we
/// ever see the plaintext again, so it must transparently upgrade any account still
/// stored at the old, weak factor without forcing a password reset.
/// </summary>
public class PasswordWorkFactorTests
{
    private static AuthService CreateService(DataContext context)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
            })
            .Build();

        var tokenService = new TokenService(configuration, new HttpContextAccessor { HttpContext = new DefaultHttpContext() }, context);
        return new AuthService(context, configuration, new NoopEmailService(), tokenService);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task Register_hashes_the_password_with_work_factor_12()
    {
        await using var context = CreateContext();
        var authService = CreateService(context);

        await authService.Register(new UserRegisterDto
        {
            FirstName = "New",
            LastName = "Owner",
            Email = "owner@acme.test",
            Password = "Password1"
        });

        var user = await context.Users.SingleAsync(u => u.Email == "owner@acme.test");
        Assert.StartsWith("$2a$12$", user.PasswordHash);
    }

    [Fact]
    public async Task Login_transparently_upgrades_a_weak_work_factor_6_hash()
    {
        await using var context = CreateContext();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "legacy@acme.test",
            FirstName = "Legacy",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1", BCrypt.Net.BCrypt.GenerateSalt(6))
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var originalHash = user.PasswordHash;

        var authService = CreateService(context);
        var result = await authService.Login(new UserLoginDto { Email = user.Email, Password = "Password1" });

        Assert.True(result.Success);
        var updated = await context.Users.SingleAsync(u => u.Email == user.Email);
        Assert.StartsWith("$2a$12$", updated.PasswordHash);
        Assert.NotEqual(originalHash, updated.PasswordHash);

        // The upgraded hash must still validate the same password.
        var secondLogin = await authService.Login(new UserLoginDto { Email = user.Email, Password = "Password1" });
        Assert.True(secondLogin.Success);
    }

    [Fact]
    public async Task Login_leaves_an_already_strong_hash_untouched()
    {
        await using var context = CreateContext();
        var strongHash = BCrypt.Net.BCrypt.HashPassword("Password1", BCrypt.Net.BCrypt.GenerateSalt(12));
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "current@acme.test",
            FirstName = "Current",
            LastName = "User",
            PasswordHash = strongHash
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var authService = CreateService(context);
        var result = await authService.Login(new UserLoginDto { Email = user.Email, Password = "Password1" });

        Assert.True(result.Success);
        var updated = await context.Users.SingleAsync(u => u.Email == user.Email);
        Assert.Equal(strongHash, updated.PasswordHash);
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
