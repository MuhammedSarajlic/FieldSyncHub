using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.UserService;

public interface IUserService
{
    Task<ApiResponse<List<GetUserDto>>> GetAllUsers();
    Task<ApiResponse<GetUserDto>> GetLoggedInUser(Guid userId);
    Task<ApiResponse<GetUserDto>> GetUserById(Guid userId);
    Task<ApiResponse<GetUserDto>> GetUserByEmail(string email);
    Task<ApiResponse<GetUserDto>> UpdateUser(UpdateUserDto updatedUser);
    Task DeleteUser(Guid userId);
}