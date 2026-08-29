using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.TokenService;

public class TokenService : ITokenService
{
    // A refresh token that reaches an API endpoint (or an access token replayed
    // into /api/auth/refresh) must be rejected on sight - this claim is what lets
    // both sides tell the two apart despite sharing the same signing key and claim
    // shape otherwise.
    private const string TokenTypeClaim = "token_type";
    private const string AccessTokenType = "access";
    private const string RefreshTokenType = "refresh";
    private const string MfaPendingTokenType = "mfa_pending";

    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;

    public TokenService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, DataContext context)
    {
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }

    public async Task<(string accessToken, string refreshToken)> GenerateTokensAsync(GetUserDto user, bool rememberMe = true)
    {
        var accessToken = CreateToken(user, DateTime.UtcNow.AddHours(24), AccessTokenType, Guid.NewGuid());

        var refreshExpiry = rememberMe ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddDays(1);
        var refreshJti = Guid.NewGuid();
        var refreshToken = CreateToken(user, refreshExpiry, RefreshTokenType, refreshJti, rememberMe);

        _context.RefreshTokens.Add(new RefreshToken
        {
            Id = refreshJti,
            UserId = user.Id,
            RememberMe = rememberMe,
            ExpiresAt = refreshExpiry
        });
        await _context.SaveChangesAsync();

        return (accessToken, refreshToken);
    }

    public void SetRefreshTokenCookie(string refreshToken, bool rememberMe = true)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = CookieSecurity.ShouldUseSecureCookies(_configuration),
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

    public async Task<Guid?> ValidateRefreshTokenAsync(string refreshToken)
    {
        var principal = ValidateSignatureAndExpiry(refreshToken);
        if (principal == null)
        {
            return null;
        }

        if (principal.FindFirstValue(TokenTypeClaim) != RefreshTokenType)
        {
            return null;
        }

        if (!Guid.TryParse(principal.FindFirstValue(JwtRegisteredClaimNames.Jti), out var jti))
        {
            return null;
        }

        var record = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Id == jti);
        if (record == null || record.RevokedAt != null || record.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        return Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : null;
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var principal = ValidateSignatureAndExpiry(refreshToken);
        if (principal == null || !Guid.TryParse(principal.FindFirstValue(JwtRegisteredClaimNames.Jti), out var jti))
        {
            return;
        }

        var record = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Id == jti);
        if (record == null || record.RevokedAt != null)
        {
            return;
        }

        record.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task RevokeAllRefreshTokensForUserAsync(Guid userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAt == null)
            .ToListAsync();

        if (activeTokens.Count == 0)
        {
            return;
        }

        var now = DateTime.UtcNow;
        foreach (var token in activeTokens)
        {
            token.RevokedAt = now;
        }
        await _context.SaveChangesAsync();
    }

    public string CreateMfaChallengeToken(Guid userId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(TokenTypeClaim, MfaPendingTokenType)
        };

        string? tokenKey = _configuration.GetSection("AppSettings:Token")?.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            issuer: JwtSettings.Issuer,
            audience: JwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Guid? ValidateMfaChallengeToken(string challengeToken)
    {
        var principal = ValidateSignatureAndExpiry(challengeToken);
        if (principal == null || principal.FindFirstValue(TokenTypeClaim) != MfaPendingTokenType)
        {
            return null;
        }

        return Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : null;
    }

    private ClaimsPrincipal? ValidateSignatureAndExpiry(string token)
    {
        string? tokenKey = _configuration.GetSection("AppSettings:Token")?.Value;
        var key = Encoding.UTF8.GetBytes(tokenKey!);

        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = JwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = JwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }

    private string CreateToken(GetUserDto user, DateTime expiresAt, string tokenType, Guid jti, bool? rememberMe = null)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("workspaceId", user.Workspace?.Id.ToString() ?? ""),
            new Claim(ClaimTypes.Role, (user.Role ?? UserRole.Employee).ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, jti.ToString()),
            new Claim(TokenTypeClaim, tokenType)
        };

        if (rememberMe.HasValue)
        {
            claims.Add(new Claim("rememberMe", rememberMe.Value.ToString()));
        }

        string? tokenKey = _configuration.GetSection("AppSettings:Token")?.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            issuer: JwtSettings.Issuer,
            audience: JwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}
