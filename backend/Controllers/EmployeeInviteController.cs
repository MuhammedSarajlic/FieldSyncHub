using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using backend.Services.EmployeeInviteService;
using backend.Models;
using backend.Dtos.UserDto;
using Mapster;

namespace backend.Controllers
{
    [Route("api/invite")]
    [ApiController]
    public class EmployeeInviteController : ControllerBase
    {
        private readonly IEmployeeInviteService _employeeInviteService;

        public EmployeeInviteController(IEmployeeInviteService employeeInviteService)
        {
            _employeeInviteService = employeeInviteService;
        }

        [HttpPost("send-invite")]
        public async Task<IActionResult> SendInvite([FromQuery] string email, [FromQuery] Guid workspaceId)
        {
            if (string.IsNullOrEmpty(email) || workspaceId == Guid.Empty)
            {
                return BadRequest("Email and workspace ID are required.");
            }
            await _employeeInviteService.SendInvite(email, workspaceId);
            return Ok($"Invitation sent to {email}");
        }

        [HttpPost("accept-invite")]
        public async Task<IActionResult> AcceptInvite(string token, [FromBody] UserLoginDto user)
        {
            var accessToken = await _employeeInviteService.AcceptInviteAsync(token, user);
            if (accessToken == null)
                return BadRequest("Invalid or expired invite.");

            return Ok(new { accessToken });
        }


        [HttpGet("validate-token")]
        public async Task<IActionResult> ValidateInviteToken([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required.");
            }

            var invite = await _employeeInviteService.ValidateInviteTokenAsync(token);
            if (invite == null)
                return NotFound("Invalid or expired invite token.");

            return Ok(invite);
        }
    }
}
