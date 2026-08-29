namespace backend.Services.TwoFactorService;

public interface ITwoFactorService
{
    /// <summary>Generates a new (not-yet-active) secret for the user to scan/enter
    /// into an authenticator app. 2FA isn't enabled until ConfirmSetupAsync succeeds.</summary>
    Task<TwoFactorSetupResult> BeginSetupAsync(Guid userId, string accountEmail);

    /// <summary>Verifies the user actually configured their authenticator correctly,
    /// enables 2FA, and issues one-time-viewable recovery codes.</summary>
    Task<TwoFactorConfirmResult> ConfirmSetupAsync(Guid userId, string code);

    /// <summary>Requires the current password as proof of intent - disabling 2FA is
    /// exactly what an attacker who stole a session (but not the authenticator)
    /// would want to do.</summary>
    Task<bool> DisableAsync(Guid userId, string currentPassword);

    /// <summary>The second step of login: a TOTP code, or a recovery code as a
    /// fallback if the authenticator itself is unavailable.</summary>
    Task<TwoFactorChallengeResult> VerifyChallengeAsync(Guid userId, string code);
}
