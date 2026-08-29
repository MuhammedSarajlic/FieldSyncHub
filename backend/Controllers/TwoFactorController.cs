using backend.Services.CurrentUserService;
using backend.Services.TokenService;
using backend.Services.TwoFactorService;
using backend.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

public record TwoFactorConfirmSetupDto(string Code);
public record TwoFactorDisableDto(string CurrentPassword);
public record TwoFactorChallengeDto(string ChallengeToken, string Code, bool RememberMe = true);

/// <summary>
/// TOTP enrolment (compatible with any standard authenticator app) plus one-time
/// recovery codes. Table stakes once real customer financial data is in the
/// system - enforced for Owner via mfaSetupRequired on the login response (see
/// AuthController), optional for everyone else.
/// </summary>
[ApiController]
[Route("api/auth/2fa")]
public class TwoFactorController : ControllerBase
{
    private readonly ITwoFactorService _twoFactorService;
    private readonly ITokenService _tokenService;
    private readonly IUserService _userService;
    private readonly ICurrentUser _currentUser;

    public TwoFactorController(ITwoFactorService twoFactorService, ITokenService tokenService, IUserService userService, ICurrentUser currentUser)
    {
        _twoFactorService = twoFactorService;
        _tokenService = tokenService;
        _userService = userService;
        _currentUser = currentUser;
    }

    [HttpPost("setup")]
    public async Task<IActionResult> BeginSetup()
    {
        if (_currentUser.UserId is not Guid userId)
        {
            return Forbid();
        }

        var userResult = await _userService.GetLoggedInUser(userId);
        if (!userResult.Success || userResult.Payload == null)
        {
            return BadRequest(new { message = "Could not load your account." });
        }

        var result = await _twoFactorService.BeginSetupAsync(userId, userResult.Payload.Email);
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { manualEntryKey = result.ManualEntryKey, otpAuthUri = result.OtpAuthUri });
    }

    [HttpPost("setup/confirm")]
    public async Task<IActionResult> ConfirmSetup(TwoFactorConfirmSetupDto dto)
    {
        if (_currentUser.UserId is not Guid userId)
        {
            return Forbid();
        }

        var result = await _twoFactorService.ConfirmSetupAsync(userId, dto.Code);
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new { recoveryCodes = result.RecoveryCodes });
    }

    [HttpPost("disable")]
    public async Task<IActionResult> Disable(TwoFactorDisableDto dto)
    {
        if (_currentUser.UserId is not Guid userId)
        {
            return Forbid();
        }

        var success = await _twoFactorService.DisableAsync(userId, dto.CurrentPassword);
        if (!success)
        {
            return BadRequest(new { message = "Incorrect password." });
        }

        return Ok(new { message = "Two-factor authentication disabled." });
    }

    /// <summary>The second step of login - exchanges a short-lived challenge token
    /// (proof the password was already correct) plus a TOTP/recovery code for real
    /// access and refresh tokens.</summary>
    [HttpPost("challenge")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Challenge(TwoFactorChallengeDto dto)
    {
        var userId = _tokenService.ValidateMfaChallengeToken(dto.ChallengeToken);
        if (userId == null)
        {
            return Unauthorized(new { message = "This login attempt has expired. Please sign in again." });
        }

        var result = await _twoFactorService.VerifyChallengeAsync(userId.Value, dto.Code);
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        var userResult = await _userService.GetLoggedInUser(userId.Value);
        if (!userResult.Success || userResult.Payload == null)
        {
            return Unauthorized();
        }

        var tokens = await _tokenService.GenerateTokensAsync(userResult.Payload, dto.RememberMe);
        _tokenService.SetRefreshTokenCookie(tokens.refreshToken, dto.RememberMe);

        return Ok(new
        {
            user = userResult.Payload,
            tokens.accessToken,
            usedRecoveryCode = result.UsedRecoveryCode,
            remainingRecoveryCodes = result.RemainingRecoveryCodes
        });
    }
}
