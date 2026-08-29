using backend.Services.TwoFactorService;

namespace backend.Tests;

/// <summary>
/// RFC 6238 TOTP is the algorithm every authenticator app (Google Authenticator,
/// Authy, 1Password, etc.) implements - these pin that this implementation
/// actually interoperates: a code generated for "now" validates, a wrong code
/// doesn't, and ordinary clock drift within one 30s step either side is tolerated.
/// </summary>
public class TotpTests
{
    [Fact]
    public void Base32_round_trips_arbitrary_bytes()
    {
        var original = new byte[] { 1, 2, 3, 4, 5, 250, 251, 252, 253, 254, 255, 0 };

        var encoded = Base32.Encode(original);
        var decoded = Base32.Decode(encoded);

        Assert.Equal(original, decoded);
    }

    [Fact]
    public void GenerateSecret_produces_a_valid_base32_string_of_the_expected_length()
    {
        var secret = Totp.GenerateSecret();

        Assert.All(secret, c => Assert.Contains(c, "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"));
        // 20 bytes -> 32 base32 characters (160 bits / 5 bits per char).
        Assert.Equal(32, secret.Length);
    }

    [Fact]
    public void GenerateSecret_is_actually_random()
    {
        var a = Totp.GenerateSecret();
        var b = Totp.GenerateSecret();

        Assert.NotEqual(a, b);
    }

    [Fact]
    public void ValidateCode_accepts_a_code_computed_for_the_current_time_step()
    {
        var secret = Totp.GenerateSecret();
        var code = GenerateCodeForTesting(secret, DateTimeOffset.UtcNow);

        Assert.True(Totp.ValidateCode(secret, code));
    }

    [Fact]
    public void ValidateCode_rejects_a_code_from_a_different_secret()
    {
        var secretA = Totp.GenerateSecret();
        var secretB = Totp.GenerateSecret();
        var codeForB = GenerateCodeForTesting(secretB, DateTimeOffset.UtcNow);

        Assert.False(Totp.ValidateCode(secretA, codeForB));
    }

    [Fact]
    public void ValidateCode_rejects_garbage_input()
    {
        var secret = Totp.GenerateSecret();

        Assert.False(Totp.ValidateCode(secret, ""));
        Assert.False(Totp.ValidateCode(secret, "12345")); // too short
        Assert.False(Totp.ValidateCode(secret, "1234567")); // too long
        Assert.False(Totp.ValidateCode(secret, "abcdef")); // not digits
    }

    [Fact]
    public void ValidateCode_tolerates_one_step_of_clock_drift()
    {
        var secret = Totp.GenerateSecret();
        var oneStepAgo = DateTimeOffset.UtcNow.AddSeconds(-30);
        var code = GenerateCodeForTesting(secret, oneStepAgo);

        Assert.True(Totp.ValidateCode(secret, code, windowSteps: 1));
    }

    [Fact]
    public void ValidateCode_rejects_a_code_far_outside_the_tolerance_window()
    {
        var secret = Totp.GenerateSecret();
        var farInThePast = DateTimeOffset.UtcNow.AddMinutes(-10);
        var code = GenerateCodeForTesting(secret, farInThePast);

        Assert.False(Totp.ValidateCode(secret, code, windowSteps: 1));
    }

    [Fact]
    public void BuildOtpAuthUri_produces_a_scannable_otpauth_uri()
    {
        var secret = Totp.GenerateSecret();

        var uri = Totp.BuildOtpAuthUri(secret, "owner@acme.test", "FieldSyncHub");

        Assert.StartsWith("otpauth://totp/", uri);
        Assert.Contains($"secret={secret}", uri);
        Assert.Contains("issuer=FieldSyncHub", uri);
    }

    /// <summary>Independently reimplements RFC 4226/6238 (see TotpTestHelper) so
    /// these tests don't just call back into the code under test to "validate" itself.</summary>
    private static string GenerateCodeForTesting(string base32Secret, DateTimeOffset at) =>
        TotpTestHelper.GenerateCode(base32Secret, at);
}
