using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend.Services.EmployeeInviteService;
using backend.Services.CurrentUserService;
using backend.Dtos.UserDto;
using backend.Dtos.EmployeeInviteDto;
using backend.Models;

namespace backend.Controllers;

[Route("api/invite")]
[ApiController]
[Authorize(Roles = "Owner,Admin")]
public class EmployeeInviteController : ControllerBase
{
    private readonly IEmployeeInviteService _employeeInviteService;
    private readonly ICurrentUser _currentUser;

    public EmployeeInviteController(IEmployeeInviteService employeeInviteService, ICurrentUser currentUser)
    {
        _employeeInviteService = employeeInviteService;
        _currentUser = currentUser;
    }

    [HttpPost("send-invite")]
    [EnableRateLimiting("invite")]
    public async Task<IActionResult> SendInvite([FromQuery] string email, [FromQuery] UserRole role = UserRole.Employee)
    {
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest("Email is required.");
        }

        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        if (role == UserRole.Owner && _currentUser.Role != UserRole.Owner)
        {
            return Forbid();
        }

        await _employeeInviteService.SendInvite(email, workspaceId, role);
        return Ok($"Invitation sent to {email}");
    }

    private const int MaxBulkInviteEmails = 10;

    [HttpPost("send-invite/bulk")]
    [EnableRateLimiting("invite")]
    public async Task<IActionResult> SendBulkInvite([FromBody] EmployeeInviteRequest request)
    {
        if (request.Emails == null || request.Emails.Count == 0)
        {
            return BadRequest("At least one email is required.");
        }

        // The "invite" rate-limit policy permits 10 requests/min per caller - a
        // single bulk call must stay within that budget instead of fanning out an
        // unbounded number of sends for the cost of one permit.
        if (request.Emails.Count > MaxBulkInviteEmails)
        {
            return BadRequest($"You can invite at most {MaxBulkInviteEmails} people at a time.");
        }

        if (_currentUser.WorkspaceId is not Guid workspaceId)
        {
            return Forbid();
        }

        if (request.Role == UserRole.Owner && _currentUser.Role != UserRole.Owner)
        {
            return Forbid();
        }

        foreach (var email in request.Emails)
        {
            await _employeeInviteService.SendInvite(email, workspaceId, request.Role);
        }

        return Ok("Invitations sent.");
    }

    [HttpPost("accept-invite")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> AcceptInvite(string token, [FromBody] UserRegisterDto user)
    {
        var accessToken = await _employeeInviteService.AcceptInviteAsync(token, user);
        if (accessToken == null)
            return BadRequest("Invalid or expired invite.");

        return Ok(new { accessToken });
    }


    [HttpGet("validate-token")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
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
