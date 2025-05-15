using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<ApiResponse<UserDto>> Register(UserLoginDto userLogin);
    Task<ApiResponse<UserDto>> Login(UserLoginDto userLogin);
    Task<ApiResponse<User>> LoginGoogle(User user);
    Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword);
    Task Logout(HttpContext httpContext);
    bool ValidateRefreshToken(string refreshToken);
    Task<ApiResponse<User>> GetUserByRefreshToken(string refreshToken);
}