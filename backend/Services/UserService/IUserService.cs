using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.UserService;

public interface IUserService
{
    Task<ApiResponse<GetUserDto>> GetLoggedInUser(Guid userId);
    Task<ApiResponse<GetUserDto>> GetUserById(Guid userId);
    Task<ApiResponse<GetUserDto>> GetUserByEmail(string email);
    Task<ApiResponse<GetUserDto>> UpdateUser(Guid callerId, UpdateUserDto updatedUser);
    Task<ApiResponse<string>> ConfirmEmailChangeAsync(string token);
    Task DeleteUser(Guid userId, Guid callerWorkspaceId);
}