using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.UserDto;

namespace backend.Services.TokenService
{
    public interface ITokenService
    {
        (string accessToken, string refreshToken) GenerateTokens(UserDto user);
        void SetRefreshTokenCookie(string refreshToken);
    }
}