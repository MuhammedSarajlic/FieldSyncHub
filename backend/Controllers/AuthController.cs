using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.AuthService;
using backend.Services.TokenService;
using backend.Services.TwoFactorService;
using backend.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IAuthService _authService;
    private readonly ITokenService _tokenService;
    private readonly IUserService _userService;
    public AuthController(IAuthService authService, IConfiguration configuration, ITokenService tokenService, IUserService userService)
    {
        _authService = authService;
        _configuration = configuration;
        _tokenService = tokenService;
        _userService = userService;
    }

    [HttpPost]
    [Route("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(UserLoginDto userLogin)
    {
        ApiResponse<GetUserDto> userDB;
        try
        {
            userDB = await _authService.Login(userLogin);
        }
        catch (AccountLockedException ex)
        {
            Response.Headers.RetryAfter = ((int)Math.Ceiling(ex.RetryAfter.TotalSeconds)).ToString();
            return StatusCode(StatusCodes.Status429TooManyRequests, new { message = ex.Message });
        }

        if (userDB.Success == false)
        {
            return BadRequest(new { message = userDB.ErrorMessage });
        }

        // The password is correct, but that's only the first factor when 2FA is
        // enabled - issue a short-lived challenge token instead of real access, so
        // whoever holds it still can't reach the API without the second factor too.
        if (userDB.Payload!.TwoFactorEnabled)
        {
            var challengeToken = _tokenService.CreateMfaChallengeToken(userDB.Payload.Id);
            return Ok(new { mfaRequired = true, challengeToken });
        }

        (string accessToken, string refreshToken) tokens = await _tokenService.GenerateTokensAsync(userDB.Payload, userLogin.RememberMe);

        _tokenService.SetRefreshTokenCookie(tokens.refreshToken, userLogin.RememberMe);

        return Ok(new
        {
            user = userDB.Payload,
            tokens.accessToken,
            mfaSetupRequired = userDB.Payload.Role == UserRole.Owner && !userDB.Payload.TwoFactorEnabled
        });
    }

    [HttpPost]
    [Route("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(UserRegisterDto userRegister)
    {
        var userDB = await _authService.Register(userRegister);

        if (userDB.Success == false)
        {
            return BadRequest(new { message = userDB.ErrorMessage });
        }

        (string accessToken, string refreshToken) tokens = await _tokenService.GenerateTokensAsync(userDB.Payload);

        _tokenService.SetRefreshTokenCookie(tokens.refreshToken);

        return Ok(new
        {
            user = userDB.Payload,
            tokens.accessToken
        });
    }

    [HttpPost]
    [Route("updatePassword/{userId:guid}")]
    public async Task<IActionResult> UpdatePassword(Guid userId, string currentPassword, string newPassword)
    {
        var userDB = await _authService.UpdatePassword(userId, currentPassword, newPassword);
        if (userDB.Success == false)
        {
            return BadRequest(userDB.ErrorMessage);
        }
        return Ok(userDB.Payload);
    }

    [HttpPost]
    [Route("google")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> GoogleLogin(GoogleAuthDto googleAuthDto)
    {
        var userDB = await _authService.LoginWithGoogle(googleAuthDto.IdToken);
        if (userDB.Success == false)
        {
            return BadRequest(new { message = userDB.ErrorMessage });
        }

        if (userDB.Payload!.TwoFactorEnabled)
        {
            var challengeToken = _tokenService.CreateMfaChallengeToken(userDB.Payload.Id);
            return Ok(new { mfaRequired = true, challengeToken });
        }

        (string accessToken, string refreshToken) tokens = await _tokenService.GenerateTokensAsync(userDB.Payload);

        _tokenService.SetRefreshTokenCookie(tokens.refreshToken);

        return Ok(new
        {
            user = userDB.Payload,
            tokens.accessToken,
            mfaSetupRequired = userDB.Payload.Role == UserRole.Owner && !userDB.Payload.TwoFactorEnabled
        });
    }

    [HttpPost]
    [Route("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
    {
        var result = await _authService.ForgotPassword(forgotPasswordDto.Email);
        return Ok(new { message = result.Payload });
    }

    [HttpPost]
    [Route("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
    {
        var result = await _authService.ResetPassword(resetPasswordDto.Token, resetPasswordDto.NewPassword);
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }
        return Ok(new { message = result.Payload });
    }

    [HttpPost]
    [Route("logout")]
    public async Task<IActionResult> Logout()
    {
        await _authService.Logout(HttpContext);
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpPost]
    [Route("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized();
        }

        // Checks signature, expiry, the "refresh" token_type claim, and that the
        // jti is a known, unrevoked row - an access token replayed here fails on
        // the type claim alone.
        var userId = await _tokenService.ValidateRefreshTokenAsync(refreshToken);
        if (userId == null)
        {
            return Unauthorized();
        }

        var userResult = await _userService.GetLoggedInUser(userId.Value);
        if (!userResult.Success || userResult.Payload == null)
        {
            return Unauthorized();
        }

        // The presented refresh token is single-use - rotate it so a copy an
        // attacker captured in transit stops working the moment the real client
        // refreshes.
        await _tokenService.RevokeRefreshTokenAsync(refreshToken);

        var rememberMe = _tokenService.GetRememberMeFromToken(refreshToken);
        (string accessToken, string newRefreshToken) tokens = await _tokenService.GenerateTokensAsync(userResult.Payload, rememberMe);

        _tokenService.SetRefreshTokenCookie(tokens.newRefreshToken, rememberMe);

        return Ok(new { accessToken = tokens.accessToken });
    }

}