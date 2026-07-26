using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Dtos.UserDto;
using backend.Models;
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

    public (string accessToken, string refreshToken) GenerateTokens(GetUserDto user, bool rememberMe = true)
    {
        var accessToken = CreateToken(user, DateTime.UtcNow.AddHours(24));
        var refreshExpiry = rememberMe ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddDays(1);
        var refreshToken = CreateToken(user, refreshExpiry, rememberMe);
        return (accessToken, refreshToken);
    }

    public void SetRefreshTokenCookie(string refreshToken, bool rememberMe = true)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Change to true in production
            SameSite = SameSiteMode.Strict,
        };

        // Remembered sessions get a persistent cookie; otherwise leave it as
        // a session cookie (no Expires) so it's cleared when the browser closes.
        if (rememberMe)
        {
            cookieOptions.Expires = DateTime.UtcNow.AddDays(30);
        }

        _httpContextAccessor.HttpContext?.Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    public bool GetRememberMeFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var claim = jwtToken.Claims.FirstOrDefault(c => c.Type == "rememberMe");
            return claim == null || bool.Parse(claim.Value);
        }
        catch
        {
            return true;
        }
    }

    private string CreateToken(GetUserDto user, DateTime expiresAt, bool? rememberMe = null)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("workspaceId", user.Workspace?.Id.ToString() ?? ""),
            new Claim(ClaimTypes.Role, user.Role.ToString() ?? UserRole.Employee.ToString())
        };

        if (rememberMe.HasValue)
        {
            claims.Add(new Claim("rememberMe", rememberMe.Value.ToString()));
        }

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