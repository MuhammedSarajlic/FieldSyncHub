using backend.Models;
using backend.Response;

namespace backend.Services.AuthService;

public interface IAuthService
{
    Task<ApiResponse<User>> Register(User user);
    Task<ApiResponse<User>> Login(User user);
    Task<ApiResponse<User>> LoginGoogle(User user);
    Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword);
    bool ValidateRefreshToken(string refreshToken);
    Task<User> GetUserByRefreshToken(string refreshToken);
}