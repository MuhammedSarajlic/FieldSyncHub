using System.Buffers.Binary;
using System.Security.Cryptography;

namespace backend.Services.TwoFactorService;

/// <summary>
/// RFC 6238 TOTP (the standard every authenticator app - Google Authenticator,
/// Authy, 1Password, etc. - implements): a 6-digit code derived from a shared
/// secret and the current 30-second time step, via HMAC-SHA1 per RFC 4226.
/// </summary>
public static class Totp
{
    private const int SecretByteLength = 20; // 160 bits, the RFC 4226 recommended size
    private const int Digits = 6;
    private const int PeriodSeconds = 30;

    public static string GenerateSecret() => Base32.Encode(RandomNumberGenerator.GetBytes(SecretByteLength));

    public static string BuildOtpAuthUri(string base32Secret, string accountEmail, string issuer)
    {
        var label = Uri.EscapeDataString($"{issuer}:{accountEmail}");
        var encodedIssuer = Uri.EscapeDataString(issuer);
        return $"otpauth://totp/{label}?secret={base32Secret}&issuer={encodedIssuer}&algorithm=SHA1&digits={Digits}&period={PeriodSeconds}";
    }

    /// <summary>Accepts a code from the current time step or one step either side,
    /// to tolerate ordinary clock drift between the server and the user's phone.</summary>
    public static bool ValidateCode(string base32Secret, string code, int windowSteps = 1)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length != Digits || !code.All(char.IsDigit))
        {
            return false;
        }

        var key = Base32.Decode(base32Secret);
        var currentCounter = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / PeriodSeconds;

        for (var offset = -windowSteps; offset <= windowSteps; offset++)
        {
            if (ComputeCode(key, currentCounter + offset) == code)
            {
                return true;
            }
        }

        return false;
    }

    private static string ComputeCode(byte[] key, long counter)
    {
        Span<byte> counterBytes = stackalloc byte[8];
        BinaryPrimitives.WriteInt64BigEndian(counterBytes, counter);

        var hash = HMACSHA1.HashData(key, counterBytes);

        // Dynamic truncation (RFC 4226 §5.3).
        var offset = hash[^1] & 0x0F;
        var binaryCode =
            ((hash[offset] & 0x7F) << 24) |
            ((hash[offset + 1] & 0xFF) << 16) |
            ((hash[offset + 2] & 0xFF) << 8) |
            (hash[offset + 3] & 0xFF);

        var code = binaryCode % (int)Math.Pow(10, Digits);
        return code.ToString(new string('0', Digits));
    }
}
