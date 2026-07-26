using backend.Dtos.UserDto;

namespace backend.Services.TokenService;

public interface ITokenService
{
    (string accessToken, string refreshToken) GenerateTokens(GetUserDto user, bool rememberMe = true);
    void SetRefreshTokenCookie(string refreshToken, bool rememberMe = true);
    bool GetRememberMeFromToken(string token);
}