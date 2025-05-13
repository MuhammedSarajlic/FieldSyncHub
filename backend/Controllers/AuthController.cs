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
        [Route("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken) || !_authService.ValidateRefreshToken(refreshToken))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByRefreshToken(refreshToken);
            if (user == null)
            {
                return Unauthorized();
            }
            var userDto = user.Adapt<UserDto>();
            (string accessToken, string newRefreshToken) tokens = GenerateTokens(userDto);

            SetRefreshTokenCookie(tokens.newRefreshToken);

            return Ok(new { accessToken = tokens.accessToken });
        }


        private (string accessToken, string refreshToken) GenerateTokens(UserDto user)
        {
            var accessToken = CreateToken(user, DateTime.UtcNow.AddMinutes(60));

            var refreshToken = CreateToken(user, DateTime.UtcNow.AddDays(30));

            return (accessToken, refreshToken);
        }

        private string CreateToken(UserDto user, DateTime expiresAt)
        {

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email)
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