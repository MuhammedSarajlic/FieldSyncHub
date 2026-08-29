namespace backend.Services.TokenService;

/// <summary>
/// ValidateIssuer/ValidateAudience were both false and no issuer or audience was
/// set when minting - a JWT forged by any other system that happened to be signed
/// with the same (e.g. leaked, reused, or brute-forced) key would still validate
/// here. These are fixed constants, not per-environment config: they identify this
/// application, the same way regardless of where it's deployed - only the signing
/// key itself needs to differ per environment.
/// </summary>
public static class JwtSettings
{
    public const string Issuer = "FieldSyncHub";
    public const string Audience = "FieldSyncHub";
}
