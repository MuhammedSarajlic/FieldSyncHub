using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<ApiResponse<GetUserDto>> Login(UserLoginDto userLogin);
    Task<ApiResponse<GetUserDto>> Register(UserRegisterDto userRegister);
    Task<ApiResponse<User>> LoginGoogle(User user);
    Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword);
    Task Logout(HttpContext httpContext);
    bool ValidateRefreshToken(string refreshToken);
    Task<ApiResponse<User>> GetUserByRefreshToken(string refreshToken);
}