using backend.Data;
using backend.Models;
using backend.Services.TwoFactorService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// End-to-end coverage of TOTP enrolment, recovery codes, and the login challenge -
/// the actual security-critical surface added by two-factor authentication.
/// </summary>
public class TwoFactorServiceTests
{
    private static (TwoFactorService service, DataContext context) CreateService()
    {
        var context = CreateContext();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
            })
            .Build();
        var protector = new TotpSecretProtector(configuration);
        var service = new TwoFactorService(context, protector, new MemoryCache(new MemoryCacheOptions()));
        return (service, context);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static async Task<User> SeedUser(DataContext context, string password = "Password1")
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "owner@acme.test",
            FirstName = "A",
            LastName = "B",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Owner
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    private static string CodeForSecret(string base32Secret) =>
        TotpTestHelper.GenerateCode(base32Secret, DateTimeOffset.UtcNow);

    [Fact]
    public async Task BeginSetup_stores_an_encrypted_secret_without_enabling_2fa_yet()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);

        var result = await service.BeginSetupAsync(user.Id, user.Email);

        Assert.True(result.Success);
        Assert.NotNull(result.ManualEntryKey);
        Assert.Contains("otpauth://totp/", result.OtpAuthUri);

        var reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        Assert.False(reloaded.TwoFactorEnabled);
        Assert.NotNull(reloaded.TwoFactorSecretEncrypted);
        Assert.DoesNotContain(result.ManualEntryKey!, reloaded.TwoFactorSecretEncrypted);
    }

    [Fact]
    public async Task BeginSetup_refuses_to_start_over_while_already_enabled()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        var setup = await service.BeginSetupAsync(user.Id, user.Email);
        await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        var secondAttempt = await service.BeginSetupAsync(user.Id, user.Email);

        Assert.False(secondAttempt.Success);
    }

    [Fact]
    public async Task ConfirmSetup_rejects_an_incorrect_code()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        await service.BeginSetupAsync(user.Id, user.Email);

        var result = await service.ConfirmSetupAsync(user.Id, "000000");

        Assert.False(result.Success);
        var reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        Assert.False(reloaded.TwoFactorEnabled);
    }

    [Fact]
    public async Task ConfirmSetup_with_the_right_code_enables_2fa_and_issues_ten_recovery_codes()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        var setup = await service.BeginSetupAsync(user.Id, user.Email);

        var result = await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        Assert.True(result.Success);
        Assert.NotNull(result.RecoveryCodes);
        Assert.Equal(10, result.RecoveryCodes!.Count);
        Assert.Equal(10, result.RecoveryCodes.Distinct().Count());

        var reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        Assert.True(reloaded.TwoFactorEnabled);
        Assert.Equal(10, await context.RecoveryCodes.CountAsync(r => r.UserId == user.Id));
    }

    [Fact]
    public async Task VerifyChallenge_accepts_a_correct_totp_code()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        var setup = await service.BeginSetupAsync(user.Id, user.Email);
        await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        var result = await service.VerifyChallengeAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        Assert.True(result.Success);
        Assert.False(result.UsedRecoveryCode);
    }

    [Fact]
    public async Task VerifyChallenge_accepts_a_recovery_code_exactly_once()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        var setup = await service.BeginSetupAsync(user.Id, user.Email);
        var confirmed = await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));
        var recoveryCode = confirmed.RecoveryCodes![0];

        var first = await service.VerifyChallengeAsync(user.Id, recoveryCode);
        Assert.True(first.Success);
        Assert.True(first.UsedRecoveryCode);
        Assert.Equal(9, first.RemainingRecoveryCodes);

        var second = await service.VerifyChallengeAsync(user.Id, recoveryCode);
        Assert.False(second.Success);
    }

    [Fact]
    public async Task VerifyChallenge_accepts_a_recovery_code_typed_without_its_hyphen_or_in_lowercase()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        var setup = await service.BeginSetupAsync(user.Id, user.Email);
        var confirmed = await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));
        var recoveryCode = confirmed.RecoveryCodes![0];
        var messyInput = recoveryCode.Replace("-", "").ToLowerInvariant();

        var result = await service.VerifyChallengeAsync(user.Id, messyInput);

        Assert.True(result.Success);
    }

    [Fact]
    public async Task VerifyChallenge_rejects_a_code_when_2fa_was_never_enabled()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);

        var result = await service.VerifyChallengeAsync(user.Id, "123456");

        Assert.False(result.Success);
    }

    [Fact]
    public async Task VerifyChallenge_locks_out_after_repeated_failures()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context);
        var setup = await service.BeginSetupAsync(user.Id, user.Email);
        await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        for (var i = 0; i < 6; i++)
        {
            await service.VerifyChallengeAsync(user.Id, "000000");
        }

        // The 7th attempt should be rejected by the lockout itself, even with the
        // genuinely correct code.
        var result = await service.VerifyChallengeAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        Assert.False(result.Success);
        Assert.Contains("Too many", result.ErrorMessage);
    }

    [Fact]
    public async Task Disable_requires_the_correct_current_password()
    {
        var (service, context) = CreateService();
        var user = await SeedUser(context, "CorrectPassword1");
        var setup = await service.BeginSetupAsync(user.Id, user.Email);
        await service.ConfirmSetupAsync(user.Id, CodeForSecret(setup.ManualEntryKey!));

        var wrongPassword = await service.DisableAsync(user.Id, "WrongPassword");
        Assert.False(wrongPassword);

        var reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        Assert.True(reloaded.TwoFactorEnabled);

        var rightPassword = await service.DisableAsync(user.Id, "CorrectPassword1");
        Assert.True(rightPassword);

        reloaded = await context.Users.SingleAsync(u => u.Id == user.Id);
        Assert.False(reloaded.TwoFactorEnabled);
        Assert.Null(reloaded.TwoFactorSecretEncrypted);
        Assert.Equal(0, await context.RecoveryCodes.CountAsync(r => r.UserId == user.Id));
    }
}

/// <summary>Shared TOTP code generator for tests, independent of the code under test.</summary>
public static class TotpTestHelper
{
    public static string GenerateCode(string base32Secret, DateTimeOffset at)
    {
        var key = Base32.Decode(base32Secret);
        var counter = at.ToUnixTimeSeconds() / 30;
        var counterBytes = BitConverter.GetBytes(counter);
        if (BitConverter.IsLittleEndian) Array.Reverse(counterBytes);

        var hash = System.Security.Cryptography.HMACSHA1.HashData(key, counterBytes);
        var offset = hash[^1] & 0x0F;
        var binaryCode =
            ((hash[offset] & 0x7F) << 24) |
            ((hash[offset + 1] & 0xFF) << 16) |
            ((hash[offset + 2] & 0xFF) << 8) |
            (hash[offset + 3] & 0xFF);

        var code = binaryCode % 1_000_000;
        return code.ToString("000000");
    }
}
