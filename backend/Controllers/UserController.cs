using System.Security.Claims;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/user/")]
    [ApiController]
    public class UserController(IUserService userService) : ControllerBase
    {
        private readonly IUserService _userService = userService;

        [HttpGet]
        public async Task<ApiResponse<List<UserDto>>> GetAllUsers()
        {
            return await _userService.GetAllUsers();
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ApiResponse<UserDto>> GetLoggedInUser()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return new ApiResponse<UserDto>
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
        public async Task<ApiResponse<UserDto>> GetUserById(Guid userId)
        {
            return await _userService.GetUserById(userId);
        }

        [HttpGet("{email}")]
        public async Task<ApiResponse<UserDto>> GetUserByEmail(string email)
        {
            return await _userService.GetUserByEmail(email);
        }

        [HttpPut]
        [Route("{userId:guid}")]
        public async Task<ApiResponse<User>> UpdateUser(UpdateUserDto user, string userId)
        {
            return await _userService.UpdateUser(user);
        }

        [HttpDelete]
        [Route("{userId:guid}")]
        public async Task DeleteUser(Guid userId)
        {
            await _userService.DeleteUser(userId);
        }


    }
}