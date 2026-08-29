using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.EmailService;
using backend.Services.TokenService;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.AuthService;

public class AuthService : IAuthService
{
    private readonly DataContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;
    private readonly IMemoryCache _cache;
    public AuthService(DataContext context, IConfiguration configuration, IEmailService emailService, ITokenService tokenService, IMemoryCache cache)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _tokenService = tokenService;
        _cache = cache;
    }

    // ASP.NET's IP-partitioned rate limiter (the "auth" policy) stops one source from
    // hammering the endpoint, but does nothing for an attacker spraying guesses at one
    // account from many source IPs/proxies. This tracks failures per account instead,
    // in-process, and makes each further guess past a small free allowance cost
    // exponentially more wall-clock time - cheap for a real user who mistyped their
    // password once or twice, expensive for anyone trying to brute-force it.
    private const int FreeLoginAttempts = 5;
    private static readonly TimeSpan LoginFailureMemory = TimeSpan.FromMinutes(30);

    private sealed class LoginFailureState
    {
        public int FailureCount;
        public DateTime? LockedUntil;
    }

    public async Task<ApiResponse<GetUserDto>> Login(UserLoginDto userLogin)
    {
        var accountKey = $"login-failures:{userLogin.Email.Trim().ToLowerInvariant()}";

        if (_cache.TryGetValue(accountKey, out LoginFailureState? state)
            && state!.LockedUntil is DateTime lockedUntil && lockedUntil > DateTime.UtcNow)
        {
            throw new AccountLockedException(lockedUntil - DateTime.UtcNow);
        }

        var dbUser = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(u => u.Email == userLogin.Email);

        if (dbUser == null || !VerifyPassword(userLogin.Password, dbUser.PasswordHash))
        {
            RecordFailedLogin(accountKey, state);
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "Invalid email or password",
                Payload = null
            };
        }

        // A genuine login clears any accumulated failures - they shouldn't keep
        // counting against a user who simply mistyped their password earlier.
        _cache.Remove(accountKey);

        // Accounts created back when the work factor was 6 still carry that weak
        // hash at rest. We only ever see the plaintext password at a successful
        // login, so that's the one place we can transparently upgrade it.
        if (BCrypt.Net.BCrypt.PasswordNeedsRehash(dbUser.PasswordHash, BcryptWorkFactor))
        {
            dbUser.PasswordHash = HashPassword(userLogin.Password);
            _context.Users.Update(dbUser);
            await _context.SaveChangesAsync();
        }

        var userDto = dbUser.Adapt<GetUserDto>();

        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            ErrorMessage = "",
            Payload = userDto
        };
    }

    private void RecordFailedLogin(string accountKey, LoginFailureState? existing)
    {
        var state = existing ?? new LoginFailureState();
        state.FailureCount++;

        if (state.FailureCount > FreeLoginAttempts)
        {
            // 15s, 30s, 60s, 120s ... capped at 15 minutes.
            var extra = state.FailureCount - FreeLoginAttempts;
            var seconds = Math.Min(900, 15 * Math.Pow(2, extra - 1));
            state.LockedUntil = DateTime.UtcNow.AddSeconds(seconds);
        }

        _cache.Set(accountKey, state, LoginFailureMemory);
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

        var userDto = user.Adapt<GetUserDto>();

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

        var user = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(u => u.GoogleId == payload.Subject);

        if (user == null)
        {
            // A plain email match against an existing password account is not proof
            // of ownership - our own registration never verifies the email address,
            // so anyone could have pre-registered the victim's email and would
            // otherwise inherit their account the first time they used "Sign in with
            // Google". Require signing in with the password instead to link accounts.
            var emailInUse = await _context.Users.AnyAsync(u => u.Email == payload.Email);
            if (emailInUse)
            {
                return new ApiResponse<GetUserDto>
                {
                    Success = false,
                    ErrorMessage = "An account with this email already exists. Sign in with your password instead.",
                    Payload = null
                };
            }

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

        var userDto = user.Adapt<GetUserDto>();

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

        // A password change should end every other session - otherwise a stolen
        // refresh token survives the very action meant to lock the attacker out.
        await _tokenService.RevokeAllRefreshTokensForUserAsync(user.Id);

        return new ApiResponse<string>
        {
            Success = true,
            ErrorMessage = "",
            Payload = "Password changed"
        };
    }

    private static readonly TimeSpan ForgotPasswordCooldown = TimeSpan.FromMinutes(2);

    public async Task<ApiResponse<string>> ForgotPassword(string email)
    {
        var cooldownKey = $"forgot-password-cooldown:{email.Trim().ToLowerInvariant()}";

        // The response below is identical no matter what happens - whether the
        // account exists, and now whether this request actually does anything - so
        // this can't be used to enumerate accounts, and repeatedly calling it can't
        // be used to mail-bomb a real address either: only the first request in the
        // cooldown window sends anything, every one after gets the same success
        // reply with no observable difference and no email going out.
        if (!_cache.TryGetValue(cooldownKey, out bool _))
        {
            _cache.Set(cooldownKey, true, ForgotPasswordCooldown);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
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

        // Same reasoning as UpdatePassword: whoever reset it should be the only one
        // left signed in, regardless of who was holding a refresh token before.
        await _tokenService.RevokeAllRefreshTokensForUserAsync(user.Id);

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
        // Clearing the cookie only stops this browser from presenting the token
        // again - the JWT itself is still valid for up to 30 days if someone
        // captured it beforehand. Revoke its server-side record too.
        var refreshToken = httpContext.Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _tokenService.RevokeRefreshTokenAsync(refreshToken);
        }

        httpContext.Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Secure = false
        });
    }

    // 64 rounds (work factor 6) is roughly a thousand times faster to brute-force
    // than the modern default; 12 (4096 rounds) is that default.
    private const int BcryptWorkFactor = 12;

    private static string HashPassword(string password)
    {
        string salt = BCrypt.Net.BCrypt.GenerateSalt(BcryptWorkFactor);
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, salt);
        return hashedPassword;
    }

    private static bool VerifyPassword(string enteredPassword, string userPassword)
    {
        return BCrypt.Net.BCrypt.Verify(enteredPassword, userPassword);
    }
}