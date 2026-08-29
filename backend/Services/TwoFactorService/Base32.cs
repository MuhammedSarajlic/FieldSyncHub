using System.Text;

namespace backend.Services.TwoFactorService;

/// <summary>RFC 4648 Base32 (no padding) - the encoding every authenticator app
/// (Google Authenticator, Authy, 1Password, etc.) expects a TOTP secret in.</summary>
public static class Base32
{
    private const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    public static string Encode(byte[] data)
    {
        var result = new StringBuilder((data.Length * 8 + 4) / 5);
        int bitBuffer = 0, bitsInBuffer = 0;

        foreach (var b in data)
        {
            bitBuffer = (bitBuffer << 8) | b;
            bitsInBuffer += 8;
            while (bitsInBuffer >= 5)
            {
                bitsInBuffer -= 5;
                result.Append(Alphabet[(bitBuffer >> bitsInBuffer) & 0x1F]);
            }
        }

        if (bitsInBuffer > 0)
        {
            result.Append(Alphabet[(bitBuffer << (5 - bitsInBuffer)) & 0x1F]);
        }

        return result.ToString();
    }

    public static byte[] Decode(string base32)
    {
        var cleaned = base32.Trim().TrimEnd('=').ToUpperInvariant();
        var bytes = new List<byte>(cleaned.Length * 5 / 8);
        int bitBuffer = 0, bitsInBuffer = 0;

        foreach (var c in cleaned)
        {
            var index = Alphabet.IndexOf(c);
            if (index < 0) continue;

            bitBuffer = (bitBuffer << 5) | index;
            bitsInBuffer += 5;
            if (bitsInBuffer >= 8)
            {
                bitsInBuffer -= 8;
                bytes.Add((byte)((bitBuffer >> bitsInBuffer) & 0xFF));
            }
        }

        return [.. bytes];
    }
}
