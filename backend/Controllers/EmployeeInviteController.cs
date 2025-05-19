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
    [Route("api/[controller]")]
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

        [HttpPost("create-invite")]
        public async Task<IActionResult> CreateInvite([FromQuery] string email, [FromQuery] Guid workspaceId, [FromQuery] string role = "employee")
        {
            if (string.IsNullOrEmpty(email) || workspaceId == Guid.Empty)
            {
                return BadRequest("Email and workspace ID are required.");
            }

            var invite = await _employeeInviteService.CreateInviteAsync(email, workspaceId, role);
            return Ok(invite);
        }

        [HttpPost("accept-invite")]
        public async Task<IActionResult> AcceptInvite([FromQuery] string token, [FromBody] UserLoginDto user)
        {
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(user.FirstName) || string.IsNullOrEmpty(user.LastName) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("All fields are required.");
            }

            var result = await _employeeInviteService.AcceptInviteAsync(token, user);
            if (!result)
                return BadRequest("Invalid or expired invite token, or user already exists.");

            return Ok("Invite accepted and user created.");
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
