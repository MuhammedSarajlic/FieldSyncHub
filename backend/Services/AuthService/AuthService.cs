using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.UserService;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.AuthService;

public class AuthService : IAuthService
{
    private readonly DataContext _context;
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    public AuthService(DataContext context, IUserService userService, IConfiguration configuration)
    {
        _context = context;
        _userService = userService;
        _configuration = configuration;
    }
    public async Task<ApiResponse<User>> GetUserByRefreshToken(string refreshToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(refreshToken);

        var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
        if (emailClaim == null) return null;

        var email = emailClaim.Value;
        var userEmail = await _userService.GetUserByEmail(email);
        var user = userEmail.Payload.Adapt<User>();
        return new ApiResponse<User>()
        {
            Success = true,
            ErrorMessage = "",
            Payload = user,
        };
    }

    public async Task<ApiResponse<UserDto>> Login(User user)
    {
        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);

        if (dbUser == null || !VerifyPassword(user.PasswordHash, dbUser.PasswordHash))
        {
            return new ApiResponse<UserDto>()
            {
                Success = false,
                ErrorMessage = "Invalid email or password",
                Payload = null
            };
        }

        UserDto userDto = new()
        {
            Id = dbUser.Id,
            FirstName = dbUser.FirstName,
            LastName = dbUser.LastName,
            Email = dbUser.Email,
        };

        return new ApiResponse<UserDto>()
        {
            Success = true,
            ErrorMessage = "",
            Payload = userDto
        };
    }

    public Task<ApiResponse<User>> LoginGoogle(User user)
    {
        throw new NotImplementedException();
    }

    public async Task<ApiResponse<UserDto>> Register(User user)
    {

        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        if (dbUser != null)
        {
            return new ApiResponse<UserDto>()
            {
                Success = false,
                ErrorMessage = "User already exists",
                Payload = null
            };
        }

        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            user.PasswordHash = HashPassword(user.PasswordHash);
        }

        user.Id = Guid.NewGuid();

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        UserDto userDto = new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return new ApiResponse<UserDto>()
        {
            Success = true,
            ErrorMessage = "",
            Payload = userDto
        };
    }


    public async Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "User not found",
                Payload = null
            };
        }

        if (!VerifyPassword(currentPassword, user.PasswordHash))
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "Incorrect password",
                Payload = null
            };
        }

        user.PasswordHash = HashPassword(newPassword);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return new ApiResponse<string>
        {
            Success = true,
            ErrorMessage = "",
            Payload = "Password changed"
        };
    }

    public bool ValidateRefreshToken(string refreshToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["AppSettings:Token"]);

        try
        {
            tokenHandler.ValidateToken(refreshToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }

    }

    private static string HashPassword(string password)
    {
        string salt = BCrypt.Net.BCrypt.GenerateSalt(6);
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, salt);
        return hashedPassword;
    }

    private static bool VerifyPassword(string enteredPassword, string userPassword)
    {
        return BCrypt.Net.BCrypt.Verify(enteredPassword, userPassword);
    }
}