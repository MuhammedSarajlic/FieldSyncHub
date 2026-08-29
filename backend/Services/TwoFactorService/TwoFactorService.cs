using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.TwoFactorService;

public class TwoFactorService : ITwoFactorService
{
    private const string Issuer = "FieldSyncHub";
    private const int RecoveryCodeCount = 10;
    private const string RecoveryCodeAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

    // Brute-forcing a 6-digit TOTP code (1,000,000 possibilities) is genuinely
    // feasible without a strict cap, unlike a password - this mirrors
    // AuthService's account-scoped login lockout for the same reason.
    private const int FreeChallengeAttempts = 5;
    private static readonly TimeSpan ChallengeFailureMemory = TimeSpan.FromMinutes(15);

    private readonly DataContext _context;
    private readonly TotpSecretProtector _protector;
    private readonly IMemoryCache _cache;

    public TwoFactorService(DataContext context, TotpSecretProtector protector, IMemoryCache cache)
    {
        _context = context;
        _protector = protector;
        _cache = cache;
    }

    public async Task<TwoFactorSetupResult> BeginSetupAsync(Guid userId, string accountEmail)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new TwoFactorSetupResult(false, "User not found.", null, null);
        }

        if (user.TwoFactorEnabled)
        {
            return new TwoFactorSetupResult(false, "Two-factor authentication is already enabled. Disable it first to re-enroll.", null, null);
        }

        var secret = Totp.GenerateSecret();
        user.TwoFactorSecretEncrypted = _protector.Encrypt(secret);
        await _context.SaveChangesAsync();

        var otpAuthUri = Totp.BuildOtpAuthUri(secret, accountEmail, Issuer);
        return new TwoFactorSetupResult(true, null, secret, otpAuthUri);
    }

    public async Task<TwoFactorConfirmResult> ConfirmSetupAsync(Guid userId, string code)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.TwoFactorSecretEncrypted))
        {
            return new TwoFactorConfirmResult(false, "No two-factor setup is in progress.", null);
        }

        var secret = _protector.Decrypt(user.TwoFactorSecretEncrypted);
        if (!Totp.ValidateCode(secret, code))
        {
            return new TwoFactorConfirmResult(false, "That code didn't match. Check your authenticator app and try again.", null);
        }

        user.TwoFactorEnabled = true;

        var plainCodes = new List<string>(RecoveryCodeCount);
        for (var i = 0; i < RecoveryCodeCount; i++)
        {
            var plainCode = GenerateRecoveryCode();
            plainCodes.Add(plainCode);
            _context.RecoveryCodes.Add(new RecoveryCode
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CodeHash = HashRecoveryCode(plainCode)
            });
        }

        await _context.SaveChangesAsync();

        return new TwoFactorConfirmResult(true, null, plainCodes);
    }

    public async Task<bool> DisableAsync(Guid userId, string currentPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
        {
            return false;
        }

        user.TwoFactorEnabled = false;
        user.TwoFactorSecretEncrypted = null;

        var codes = await _context.RecoveryCodes.Where(r => r.UserId == userId).ToListAsync();
        _context.RecoveryCodes.RemoveRange(codes);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TwoFactorChallengeResult> VerifyChallengeAsync(Guid userId, string code)
    {
        var lockoutKey = $"2fa-challenge-failures:{userId}";
        if (_cache.TryGetValue(lockoutKey, out ChallengeFailureState? state)
            && state!.LockedUntil is DateTime lockedUntil && lockedUntil > DateTime.UtcNow)
        {
            return new TwoFactorChallengeResult(false, "Too many failed attempts. Please try again later.", false, 0);
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.TwoFactorEnabled || string.IsNullOrEmpty(user.TwoFactorSecretEncrypted))
        {
            return new TwoFactorChallengeResult(false, "Two-factor authentication is not enabled for this account.", false, 0);
        }

        var secret = _protector.Decrypt(user.TwoFactorSecretEncrypted);
        if (Totp.ValidateCode(secret, code))
        {
            _cache.Remove(lockoutKey);
            var remaining = await _context.RecoveryCodes.CountAsync(r => r.UserId == userId && r.UsedAt == null);
            return new TwoFactorChallengeResult(true, null, false, remaining);
        }

        var normalizedCode = NormalizeRecoveryCode(code);
        var candidateHash = HashRecoveryCode(normalizedCode);
        var matchedRecoveryCode = await _context.RecoveryCodes
            .Where(r => r.UserId == userId && r.UsedAt == null)
            .FirstOrDefaultAsync(r => r.CodeHash == candidateHash);

        if (matchedRecoveryCode != null)
        {
            matchedRecoveryCode.UsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _cache.Remove(lockoutKey);
            var remaining = await _context.RecoveryCodes.CountAsync(r => r.UserId == userId && r.UsedAt == null);
            return new TwoFactorChallengeResult(true, null, true, remaining);
        }

        RecordFailedChallenge(lockoutKey, state);
        return new TwoFactorChallengeResult(false, "Invalid code.", false, 0);
    }

    private sealed class ChallengeFailureState
    {
        public int FailureCount;
        public DateTime? LockedUntil;
    }

    private void RecordFailedChallenge(string lockoutKey, ChallengeFailureState? existing)
    {
        var state = existing ?? new ChallengeFailureState();
        state.FailureCount++;

        if (state.FailureCount > FreeChallengeAttempts)
        {
            var extra = state.FailureCount - FreeChallengeAttempts;
            var seconds = Math.Min(900, 15 * Math.Pow(2, extra - 1));
            state.LockedUntil = DateTime.UtcNow.AddSeconds(seconds);
        }

        _cache.Set(lockoutKey, state, ChallengeFailureMemory);
    }

    private static string GenerateRecoveryCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(8);
        var chars = new char[8];
        for (var i = 0; i < bytes.Length; i++)
        {
            chars[i] = RecoveryCodeAlphabet[bytes[i] % RecoveryCodeAlphabet.Length];
        }
        return $"{new string(chars, 0, 4)}-{new string(chars, 4, 4)}";
    }

    private static string NormalizeRecoveryCode(string code) =>
        new string(code.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();

    private static string HashRecoveryCode(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(NormalizeRecoveryCode(code))));
}
