using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Dtos.UserDto;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.TokenService;

public class TokenService : ITokenService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    public TokenService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
    {
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public (string accessToken, string refreshToken) GenerateTokens(UserDto user)
    {
        var accessToken = CreateToken(user, DateTime.UtcNow.AddMinutes(60));
        var refreshToken = CreateToken(user, DateTime.UtcNow.AddDays(30));
        return (accessToken, refreshToken);
    }

    public void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Change to true in production
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(30)
        };

        _httpContextAccessor.HttpContext?.Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private string CreateToken(UserDto user, DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("workspaceId", user.Workspace?.Id.ToString() ?? ""),
            new Claim(ClaimTypes.Role, user.Role?.ToString() ?? "user")
        };

        string? tokenKey = _configuration.GetSection("AppSettings:Token")?.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}