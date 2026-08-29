using System.Security.Cryptography;
using System.Text;

namespace backend.Services.TwoFactorService;

/// <summary>
/// Encrypts the TOTP secret at rest. Unlike a password reset token, a TOTP secret
/// is inherently reversible (the server must recompute the current valid code to
/// verify one), so it can't just be hashed - a database read must not hand over a
/// value usable to mint valid codes forever. Derives its own AES key from the
/// existing JWT signing key (domain-separated via a distinct label) rather than
/// requiring yet another secret to configure and rotate.
/// </summary>
public class TotpSecretProtector
{
    private readonly byte[] _key;

    public TotpSecretProtector(IConfiguration configuration)
    {
        var tokenKey = configuration["AppSettings:Token"]
            ?? throw new InvalidOperationException("AppSettings:Token is not configured.");
        _key = SHA256.HashData(Encoding.UTF8.GetBytes(tokenKey + ":totp-secret-encryption"));
    }

    public string Encrypt(string plaintext)
    {
        var nonce = RandomNumberGenerator.GetBytes(AesGcm.NonceByteSizes.MaxSize);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = new byte[plaintextBytes.Length];
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];

        using (var aes = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize))
        {
            aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);
        }

        return Convert.ToBase64String([.. nonce, .. ciphertext, .. tag]);
    }

    public string Decrypt(string encrypted)
    {
        var all = Convert.FromBase64String(encrypted);
        var nonceSize = AesGcm.NonceByteSizes.MaxSize;
        var tagSize = AesGcm.TagByteSizes.MaxSize;

        var nonce = all[..nonceSize];
        var tag = all[^tagSize..];
        var ciphertext = all[nonceSize..^tagSize];
        var plaintext = new byte[ciphertext.Length];

        using (var aes = new AesGcm(_key, tagSize))
        {
            aes.Decrypt(nonce, ciphertext, tag, plaintext);
        }

        return Encoding.UTF8.GetString(plaintext);
    }
}
