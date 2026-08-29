namespace backend.Services.TwoFactorService;

public record TwoFactorSetupResult(bool Success, string? ErrorMessage, string? ManualEntryKey, string? OtpAuthUri);

public record TwoFactorConfirmResult(bool Success, string? ErrorMessage, List<string>? RecoveryCodes);

public record TwoFactorChallengeResult(bool Success, string? ErrorMessage, bool UsedRecoveryCode, int RemainingRecoveryCodes);
