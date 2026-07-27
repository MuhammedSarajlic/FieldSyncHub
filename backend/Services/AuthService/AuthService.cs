using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.EmailService;
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
    private readonly IEmailService _emailService;
    public AuthService(DataContext context, IUserService userService, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _userService = userService;
        _configuration = configuration;
        _emailService = emailService;
    }
    public async Task<ApiResponse<User>> GetUserByRefreshToken(string refreshToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var jwtToken = tokenHandler.ReadJwtToken(refreshToken);

            var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);
            if (emailClaim == null) return new ApiResponse<User> { Success = false, ErrorMessage = "Invalid refresh token (email claim missing)." };

            var email = emailClaim.Value;
            var userEmailResult = await _userService.GetUserByEmail(email);

            if (!userEmailResult.Success)
            {
                return new ApiResponse<User> { Success = false, ErrorMessage = "User not found for the provided email." };
            }

            var user = userEmailResult.Payload.Adapt<User>();
            return new ApiResponse<User>()
            {
                Success = true,
                ErrorMessage = "",
                Payload = user,
            };
        }
        catch (Exception)
        {
            return new ApiResponse<User> { Success = false, ErrorMessage = "Invalid refresh token." };
        }
    }

    public async Task<ApiResponse<GetUserDto>> Login(UserLoginDto userLogin)
    {
        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userLogin.Email);

        if (dbUser == null || !VerifyPassword(userLogin.Password, dbUser.PasswordHash))
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "Invalid email or password",
                Payload = null
            };
        }

        GetUserDto userDto = new()
        {
            Id = dbUser.Id,
            FirstName = dbUser.FirstName,
            LastName = dbUser.LastName,
            Email = dbUser.Email,
            CreatedAt = dbUser.CreatedAt,
            UpdatedAt = dbUser.UpdatedAt
        };

        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            ErrorMessage = "",
            Payload = userDto
        };
    }

    public async Task<ApiResponse<GetUserDto>> Register(UserRegisterDto userRegister)
    {
        if (string.IsNullOrWhiteSpace(userRegister.FirstName) || string.IsNullOrWhiteSpace(userRegister.LastName))
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "First and last name are required",
                Payload = null
            };
        }

        if (string.IsNullOrWhiteSpace(userRegister.Email))
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "Email is required",
                Payload = null
            };
        }

        if (string.IsNullOrEmpty(userRegister.Password) || userRegister.Password.Length < 8)
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "Password must be at least 8 characters",
                Payload = null
            };
        }

        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userRegister.Email);
        if (dbUser != null)
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "User already exists",
                Payload = null
            };
        }

        userRegister.Password = HashPassword(userRegister.Password);

        User user = new()
        {
            Id = Guid.NewGuid(),
            FirstName = userRegister.FirstName,
            LastName = userRegister.LastName,
            PasswordHash = userRegister.Password,
            Email = userRegister.Email,
            Role = UserRole.Owner
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        GetUserDto userDto = new()
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = userDto,
            ErrorMessage = ""
        };
    }

    public async Task<ApiResponse<GetUserDto>> LoginWithGoogle(string idToken)
    {
        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            var clientId = _configuration["AppSettings:GoogleClientId"];
            payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(idToken, new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            });
        }
        catch (Exception)
        {
            return new ApiResponse<GetUserDto>
            {
                Success = false,
                ErrorMessage = "Invalid Google credential.",
                Payload = null
            };
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject || u.Email == payload.Email);

        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = payload.Email,
                FirstName = string.IsNullOrEmpty(payload.GivenName) ? (payload.Name ?? "Google") : payload.GivenName,
                LastName = string.IsNullOrEmpty(payload.FamilyName) ? "User" : payload.FamilyName,
                GoogleId = payload.Subject,
                Role = UserRole.Owner
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
        else if (user.GoogleId == null)
        {
            // Existing email/password account signing in with Google for the
            // first time - link the two rather than creating a duplicate user.
            user.GoogleId = payload.Subject;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        GetUserDto userDto = new()
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return new ApiResponse<GetUserDto>()
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

        if (string.IsNullOrEmpty(newPassword) || newPassword.Length < 8)
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "Password must be at least 8 characters",
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

    public async Task<ApiResponse<string>> ForgotPassword(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Only act if the account exists, but always return the same
        // response either way so this endpoint can't be used to enumerate
        // which emails have accounts.
        if (user != null)
        {
            var token = GenerateSecureToken();
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173";
            var resetLink = $"{frontendUrl}/reset-password?token={token}";
            var html = $"<p>Someone requested a password reset for your FieldSyncHub account.</p>" +
                       $"<p><a href=\"{resetLink}\">Reset your password</a></p>" +
                       $"<p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>";
            var plainText = $"Reset your FieldSyncHub password: {resetLink} (expires in 1 hour)";

            try
            {
                await _emailService.SendEmailAsync(user.Email, "Reset your FieldSyncHub password", plainText, html);
            }
            catch (Exception ex)
            {
                // The reset token is already saved - a broken/missing email
                // provider shouldn't turn into a 500 for the user, and this
                // response is deliberately identical whether or not the
                // email actually went out (see comment above).
                Console.WriteLine($"Failed to send password reset email to {user.Email}: {ex.Message}");
            }
        }

        return new ApiResponse<string>
        {
            Success = true,
            ErrorMessage = "",
            Payload = "If an account with that email exists, a password reset link has been sent."
        };
    }

    public async Task<ApiResponse<string>> ResetPassword(string token, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == token);

        if (user == null || user.PasswordResetTokenExpiresAt == null || user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "This password reset link is invalid or has expired.",
                Payload = null
            };
        }

        if (string.IsNullOrEmpty(newPassword) || newPassword.Length < 8)
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "Password must be at least 8 characters",
                Payload = null
            };
        }

        user.PasswordHash = HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return new ApiResponse<string>
        {
            Success = true,
            ErrorMessage = "",
            Payload = "Password reset successful."
        };
    }

    private static string GenerateSecureToken()
    {
        var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    public async Task Logout(HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Secure = false
        });
        await Task.CompletedTask;
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