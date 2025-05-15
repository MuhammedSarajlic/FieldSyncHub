using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.AuthService;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
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

            (string accessToken, string refreshToken) tokens = GenerateTokens(userDB.Payload);

            SetRefreshTokenCookie(tokens.refreshToken);

            return Ok(new
            {
                user = userDB.Payload,
                accessToken = tokens.accessToken
            });
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register(UserLoginDto userLogin)
        {
            var userDB = await _authService.Register(userLogin);

            if (userDB.Success == false)
            {
                return BadRequest(new { message = userDB.ErrorMessage });
            }

            (string accessToken, string refreshToken) tokens = GenerateTokens(userDB.Payload);

            SetRefreshTokenCookie(tokens.refreshToken);

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
            return Ok(new {  message = "Logged out successfully" });
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
            var userDto = userResult.Payload.Adapt<UserDto>();
            (string accessToken, string newRefreshToken) tokens = GenerateTokens(userDto); // Line 111

            SetRefreshTokenCookie(tokens.newRefreshToken);

            return Ok(new { accessToken = tokens.accessToken });
        }


        private (string accessToken, string refreshToken) GenerateTokens(UserDto user) // Line 121
        {
            var accessToken = CreateToken(user, DateTime.UtcNow.AddMinutes(60)); // Line 131 (where the error occurs)
            var refreshToken = CreateToken(user, DateTime.UtcNow.AddDays(30));
            return (accessToken, refreshToken);
        }

        private string CreateToken(UserDto user, DateTime expiresAt)
        {

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // this is standard
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


        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30)
            };

            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }

    }
}