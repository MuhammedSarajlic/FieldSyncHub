using backend.Dtos.UserDto;
using backend.Services.AuthService;
using backend.Services.TokenService;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IAuthService _authService;
    private readonly ITokenService _tokenService;
    public AuthController(IAuthService authService, IConfiguration configuration, ITokenService tokenService)
    {
        _authService = authService;
        _configuration = configuration;
        _tokenService = tokenService;
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login(UserLoginDto userLogin)
    {
        var userDB = await _authService.Login(userLogin);
        if (userDB.Success == false)
        {
            return BadRequest(new { message = userDB.ErrorMessage });
        }

        (string accessToken, string refreshToken) tokens = _tokenService.GenerateTokens(userDB.Payload);

        _tokenService.SetRefreshTokenCookie(tokens.refreshToken);

        return Ok(new
        {
            user = userDB.Payload,
            tokens.accessToken
        });
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register(UserRegisterDto userRegister)
    {
        var userDB = await _authService.Register(userRegister);

        if (userDB.Success == false)
        {
            return BadRequest(new { message = userDB.ErrorMessage });
        }

        (string accessToken, string refreshToken) tokens = _tokenService.GenerateTokens(userDB.Payload);

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
    [Route("logout")]
    public async Task<IActionResult> Logout()
    {
        await _authService.Logout(HttpContext);
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpPost]
    [Route("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken) || !_authService.ValidateRefreshToken(refreshToken))
        {
            return Unauthorized();
        }

        var userResult = await _authService.GetUserByRefreshToken(refreshToken);
        if (!userResult.Success || userResult.Payload == null)
        {
            return Unauthorized();
        }
        var userDto = userResult.Payload.Adapt<GetUserDto>();
        (string accessToken, string newRefreshToken) tokens = _tokenService.GenerateTokens(userDto);

        _tokenService.SetRefreshTokenCookie(tokens.newRefreshToken);

        return Ok(new { accessToken = tokens.accessToken });
    }

}