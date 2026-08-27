using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services.EmployeeInviteService;
using backend.Dtos.UserDto;
using backend.Dtos.EmployeeInviteDto;

namespace backend.Controllers;

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

    [HttpPost("send-invite/bulk")]
    public async Task<IActionResult> SendBulkInvite([FromBody] EmployeeInviteRequest request)
    {
        if (request.Emails == null || request.Emails.Count == 0 || request.WorkspaceId == Guid.Empty)
        {
            return BadRequest("At least one email and a valid workspace ID are required.");
        }

        foreach (var email in request.Emails)
        {
            await _employeeInviteService.SendInvite(email, request.WorkspaceId);
        }

        return Ok("Invitations sent.");
    }

    [HttpPost("accept-invite")]
    [AllowAnonymous]
    public async Task<IActionResult> AcceptInvite(string token, [FromBody] UserRegisterDto user)
    {
        var accessToken = await _employeeInviteService.AcceptInviteAsync(token, user);
        if (accessToken == null)
            return BadRequest("Invalid or expired invite.");

        return Ok(new { accessToken });
    }


    [HttpGet("validate-token")]
    [AllowAnonymous]
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
