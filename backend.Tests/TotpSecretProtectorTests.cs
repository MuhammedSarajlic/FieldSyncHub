using backend.Services.TwoFactorService;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// A TOTP secret is inherently reversible - the server must recompute the current
/// valid code to check one - so unlike a password reset token it can't just be
/// hashed. It's encrypted at rest instead; these pin that it round-trips, and that
/// a database read alone (i.e. the ciphertext, without the signing key) doesn't
/// hand over anything usable.
/// </summary>
public class TotpSecretProtectorTests
{
    private static TotpSecretProtector CreateProtector(string signingKey = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234")
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["AppSettings:Token"] = signingKey })
            .Build();
        return new TotpSecretProtector(configuration);
    }

    [Fact]
    public void Encrypt_then_decrypt_returns_the_original_secret()
    {
        var protector = CreateProtector();
        var secret = Totp.GenerateSecret();

        var encrypted = protector.Encrypt(secret);
        var decrypted = protector.Decrypt(encrypted);

        Assert.Equal(secret, decrypted);
    }

    [Fact]
    public void Encrypted_value_never_contains_the_plaintext_secret()
    {
        var protector = CreateProtector();
        var secret = Totp.GenerateSecret();

        var encrypted = protector.Encrypt(secret);

        Assert.DoesNotContain(secret, encrypted);
    }

    [Fact]
    public void Encrypting_the_same_secret_twice_produces_different_ciphertext()
    {
        // A fresh random nonce every time - so equal secrets don't leak equal rows.
        var protector = CreateProtector();
        var secret = Totp.GenerateSecret();

        var first = protector.Encrypt(secret);
        var second = protector.Encrypt(secret);

        Assert.NotEqual(first, second);
        Assert.Equal(secret, protector.Decrypt(first));
        Assert.Equal(secret, protector.Decrypt(second));
    }

    [Fact]
    public void Decrypting_with_a_different_signing_key_fails()
    {
        var secret = Totp.GenerateSecret();
        var encrypted = CreateProtector("key-one-test-signing-key-test-signing-key-test-signing-key-1234").Encrypt(secret);

        var otherProtector = CreateProtector("key-two-test-signing-key-test-signing-key-test-signing-key-1234");
        Assert.ThrowsAny<Exception>(() => otherProtector.Decrypt(encrypted));
    }
}
