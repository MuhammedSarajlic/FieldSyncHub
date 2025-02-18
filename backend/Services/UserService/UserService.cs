using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly DataContext _context;

        public UserService(DataContext context)
        {
            _context = context;
        }

        public async Task DeleteUser(Guid userId)
        {
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            _context.Users.Remove(dbUser);
            await _context.SaveChangesAsync();
        }

        public async Task<ApiResponse<List<UserDto>>> GetAllUsers()
        {
            var dbUsers = await _context.Users.ToListAsync();
            var userDto = dbUsers.Select(u => u.Adapt<UserDto>()).ToList();

            return new ApiResponse<List<UserDto>>()
            {
                Success = true,
                Payload = userDto,
                ErrorMessage = null
            };
        }

        public async Task<ApiResponse<UserDto>> GetUserByEmail(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(e => e.Email == email);
            if (user == null)
            {
                return new ApiResponse<UserDto>()
                {
                    Success = false,
                    ErrorMessage = "Not Found",
                    Payload = null
                };
            }
            var userDto = user.Adapt<UserDto>();
            return new ApiResponse<UserDto>()
            {
                Success = true,
                Payload = userDto,
                ErrorMessage = null
            };
        }

        public async Task<ApiResponse<UserDto>> GetUserById(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(id => id.Id == userId);
            if (user == null)
            {
                return new ApiResponse<UserDto>()
                {
                    Success = false,
                    ErrorMessage = "Not Found",
                    Payload = null
                };
            }
            var userDto = user.Adapt<UserDto>();
            return new ApiResponse<UserDto>()
            {
                Success = true,
                Payload = userDto,
                ErrorMessage = null
            };
        }

        public async Task<ApiResponse<User>> UpdateUser(UpdateUserDto updatedUser)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == updatedUser.Id);

            if (existingUser == null)
            {
                return new ApiResponse<User>()
                {
                    Success = false,
                    Payload = null,
                    ErrorMessage = "User not found"
                };
            }

            existingUser.FirstName = updatedUser.FirstName;
            existingUser.LastName = updatedUser.LastName;
            existingUser.Email = updatedUser.Email;
            existingUser.UpdatedAt = DateTime.Now;

            _context.Users.Update(existingUser);

            await _context.SaveChangesAsync();

            return new ApiResponse<User>()
            {
                Success = true,
                Payload = existingUser,
                ErrorMessage = null
            };
        }

    }
}