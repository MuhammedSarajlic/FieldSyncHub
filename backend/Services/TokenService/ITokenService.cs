using backend.Dtos.UserDto;

namespace backend.Services.TokenService;

public interface ITokenService
{
    Task<(string accessToken, string refreshToken)> GenerateTokensAsync(GetUserDto user, bool rememberMe = true);
    void SetRefreshTokenCookie(string refreshToken, bool rememberMe = true);
    bool GetRememberMeFromToken(string token);

    /// <summary>
    /// Validates signature, expiry, the "refresh" token_type claim, and that the
    /// token's jti is a known, unrevoked row in the RefreshTokens table. Returns the
    /// token's owner if valid, or null otherwise - never throws.
    /// </summary>
    Task<Guid?> ValidateRefreshTokenAsync(string refreshToken);
    Task<Guid?> GetRefreshTokenWorkspaceAsync(string refreshToken);

    /// <summary>Revokes one refresh token by jti (a no-op if it's not a valid, known token).</summary>
    Task RevokeRefreshTokenAsync(string refreshToken);

    /// <summary>Revokes every outstanding refresh token for a user - e.g. on password change.</summary>
    Task RevokeAllRefreshTokensForUserAsync(Guid userId);

}
