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
/// TokenService issued refresh tokens with no server-side record at all, so nothing
/// could revoke one before its natural (up to 30-day) expiry. These pin the
/// persistence/validation/revocation contract directly, plus that a password change
/// revokes every outstanding refresh token for that user - not just the session that
/// changed it.
/// </summary>
public class TokenServiceTests
{
    private static (TokenService tokenService, DataContext context) CreateService()
    {
        var context = CreateContext();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
            })
            .Build();

        var tokenService = new TokenService(configuration, new HttpContextAccessor { HttpContext = new DefaultHttpContext() }, context);
        return (tokenService, context);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static GetUserDto TestUser(Guid id) => new()
    {
        Id = id,
        Email = "user@acme.test",
        FirstName = "A",
        LastName = "B",
        Role = UserRole.Employee
    };

    [Fact]
    public async Task GenerateTokensAsync_persists_the_refresh_token_and_validates_it_back()
    {
        var (tokenService, context) = CreateService();
        var userId = Guid.NewGuid();

        var (_, refreshToken) = await tokenService.GenerateTokensAsync(TestUser(userId));

        Assert.Equal(1, await context.RefreshTokens.CountAsync());
        var validatedUserId = await tokenService.ValidateRefreshTokenAsync(refreshToken);
        Assert.Equal(userId, validatedUserId);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_rejects_an_access_token()
    {
        var (tokenService, _) = CreateService();
        var (accessToken, _) = await tokenService.GenerateTokensAsync(TestUser(Guid.NewGuid()));

        var result = await tokenService.ValidateRefreshTokenAsync(accessToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_makes_the_token_stop_validating()
    {
        var (tokenService, _) = CreateService();
        var (_, refreshToken) = await tokenService.GenerateTokensAsync(TestUser(Guid.NewGuid()));

        await tokenService.RevokeRefreshTokenAsync(refreshToken);
        var result = await tokenService.ValidateRefreshTokenAsync(refreshToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task RevokeAllRefreshTokensForUserAsync_revokes_every_token_for_that_user_only()
    {
        var (tokenService, _) = CreateService();
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var (_, tokenA) = await tokenService.GenerateTokensAsync(TestUser(userId));
        var (_, tokenB) = await tokenService.GenerateTokensAsync(TestUser(userId));
        var (_, otherUsersToken) = await tokenService.GenerateTokensAsync(TestUser(otherUserId));

        await tokenService.RevokeAllRefreshTokensForUserAsync(userId);

        Assert.Null(await tokenService.ValidateRefreshTokenAsync(tokenA));
        Assert.Null(await tokenService.ValidateRefreshTokenAsync(tokenB));
        Assert.NotNull(await tokenService.ValidateRefreshTokenAsync(otherUsersToken));
    }

    [Fact]
    public async Task UpdatePassword_revokes_all_of_the_users_refresh_tokens()
    {
        var (tokenService, context) = CreateService();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@acme.test",
            FirstName = "A",
            LastName = "B",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword1")
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var (_, refreshToken) = await tokenService.GenerateTokensAsync(TestUser(user.Id));

        var configuration = new ConfigurationBuilder().Build();
        var authService = new AuthService(context, configuration, new NoopEmailService(), tokenService, new MemoryCache(new MemoryCacheOptions()));

        var result = await authService.UpdatePassword(user.Id, "OldPassword1", "NewPassword1");

        Assert.True(result.Success);
        Assert.Null(await tokenService.ValidateRefreshTokenAsync(refreshToken));
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
