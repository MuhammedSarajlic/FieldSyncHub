using backend.Data;
using backend.Models;
using backend.Response;
using backend.Services;

namespace backend.Services.AuthService;

public class AuthService : IAuthService
{
     private readonly DataContext _context;
     private readonly IUserService _userService;
     public AuthService(DataContext context, IUserService userService)
     {
         _context = context;
         _userService = userService;
     }
    public Task<User> GetUserByRefreshToken(string refreshToken)
    {
        throw new NotImplementedException();
    }

    public Task<ApiResponse<User>> Login(User user)
    {
        // var userDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        // if(userDb == null || !VerifyPassword(user.HashedPassword, userDb.HashedPassword)){
        //     return new ApiResponse<UserDto>(){
        //         Success = false,
        //         ErrorMessage = "Incorrect credentials",
        //         Payload = null
        //     };
        // }

        // UserDto userDto = new UserDto
        // {
        //     Id = userDb.Id,
        //     Name = userDb.Name,
        //     Email = userDb.Email,
        // };

        // return new ApiResponse<UserDto>(){
        //     Success = true,
        //     ErrorMessage = "",
        //     Payload = userDto
        // };
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

    private string HashPassword(string password)
    {
        string salt = BCrypt.Net.BCrypt.GenerateSalt(6);
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, salt);
        return hashedPassword;
    }

    private bool VerifyPassword(string enteredPassword, string userPassword)
    {
        return BCrypt.Net.BCrypt.Verify(enteredPassword, userPassword);
    }
}