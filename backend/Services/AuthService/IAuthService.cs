using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<ApiResponse<UserDto>> Register(User user);
    Task<ApiResponse<UserDto>> Login(User user);
    Task<ApiResponse<User>> LoginGoogle(User user);
    Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword);
    bool ValidateRefreshToken(string refreshToken);
    Task<ApiResponse<User>> GetUserByRefreshToken(string refreshToken);
}