using backend.Data;
using backend.Models;
using backend.Response;

namespace backend.Services.AuthService;

public class AuthService : IAuthService
{
    public AuthService(DataContext context)
    {
        
    }
    public Task<User> GetUserByRefreshToken(string refreshToken)
    {
        throw new NotImplementedException();
    }

    public Task<ApiResponse<User>> Login(User user)
    {
        throw new NotImplementedException();
    }

    public Task<ApiResponse<User>> LoginGoogle(User user)
    {
        throw new NotImplementedException();
    }

    public Task<ApiResponse<User>> Register(User user)
    {
        throw new NotImplementedException();
    }

    public Task<ApiResponse<string>> UpdatePassword(Guid userId, string currentPassword, string newPassword)
    {
        throw new NotImplementedException();
    }

    public bool ValidateRefreshToken(string refreshToken)
    {
        throw new NotImplementedException();
    }
}