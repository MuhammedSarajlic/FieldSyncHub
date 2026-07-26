using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<ApiResponse<GetUserDto>> Login(UserLoginDto userLogin);
    Task<ApiResponse<GetUserDto>> Register(UserRegisterDto userRegister);
    Task<ApiResponse<GetUserDto>> LoginWithGoogle(string idToken);
    Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword);
    Task<ApiResponse<string>> ForgotPassword(string email);
    Task<ApiResponse<string>> ResetPassword(string token, string newPassword);
    Task Logout(HttpContext httpContext);
    bool ValidateRefreshToken(string refreshToken);
    Task<ApiResponse<User>> GetUserByRefreshToken(string refreshToken);
}