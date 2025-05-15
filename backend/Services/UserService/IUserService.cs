using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;

namespace backend.Services.UserService
{
    public interface IUserService
    {
        Task<ApiResponse<List<UserDto>>> GetAllUsers();
        Task<ApiResponse<UserDto>> GetLoggedInUser(Guid userId);
        Task<ApiResponse<UserDto>> GetUserById(Guid userId);
        Task<ApiResponse<UserDto>> GetUserByEmail(string email);
        Task<ApiResponse<User>> UpdateUser(UpdateUserDto updatedUser);
        Task DeleteUser(Guid userId);
    }
}