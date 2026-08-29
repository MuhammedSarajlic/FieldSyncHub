namespace backend.Services.AuthService;

/// <summary>
/// Thrown by AuthService.Login when an account has too many recent failed attempts.
/// Carries how long the caller must wait so the controller can surface a proper
/// 429 with a Retry-After header instead of a generic bad-credentials response.
/// </summary>
public class AccountLockedException : Exception
{
    public TimeSpan RetryAfter { get; }

    public AccountLockedException(TimeSpan retryAfter)
        : base("Too many failed login attempts. Please try again later.")
    {
        RetryAfter = retryAfter;
    }
}
