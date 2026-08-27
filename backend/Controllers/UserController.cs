using System.Security.Claims;
using backend.Dtos.UserDto;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICurrentUser _currentUser;

    public UserController(IUserService userService, ICurrentUser currentUser)
    {
        _userService = userService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ApiResponse<GetUserDto>> GetLoggedInUser()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
        {
            return new ApiResponse<GetUserDto>
            {
                Success = false,
                ErrorMessage = "Invalid or missing user ID in token.",
                Payload = null
            };
        }

        return await _userService.GetLoggedInUser(userId);
    }

    [HttpGet]
    [Route("{userId:guid}")]
    public async Task<ActionResult<ApiResponse<GetUserDto>>> GetUserById(Guid userId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _userService.GetUserById(userId, callerWorkspaceId));
    }

    [HttpGet("{email}")]
    public async Task<ActionResult<ApiResponse<GetUserDto>>> GetUserByEmail(string email)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _userService.GetUserByEmail(email, callerWorkspaceId));
    }

    [HttpPut]
    public async Task<ApiResponse<GetUserDto>> UpdateUser(UpdateUserDto user)
    {
        if (_currentUser.UserId is not Guid callerId)
        {
            return new ApiResponse<GetUserDto>
            {
                Success = false,
                ErrorMessage = "Invalid or missing user ID in token.",
                Payload = null
            };
        }

        return await _userService.UpdateUser(callerId, user);
    }

    [HttpPost("confirm-email-change")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmailChange([FromQuery] string token)
    {
        var result = await _userService.ConfirmEmailChangeAsync(token);
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }
        return Ok(new { message = result.Payload });
    }

    [HttpDelete]
    [Route("{userId:guid}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _userService.DeleteUser(userId, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        return Ok();
    }
}