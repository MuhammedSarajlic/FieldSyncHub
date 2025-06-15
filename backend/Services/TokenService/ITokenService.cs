using backend.Dtos.UserDto;

namespace backend.Services.TokenService;

public interface ITokenService
{
    (string accessToken, string refreshToken) GenerateTokens(GetUserDto user);
    void SetRefreshTokenCookie(string refreshToken);
}