using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.UserService;

public class UserService : IUserService
{
    private readonly DataContext _context;

    public UserService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<GetUserDto>>> GetAllUsers()
    {
        var dbUsers = await _context.Users.Include(u => u.Workspace).ToListAsync();
        var userDto = dbUsers.Select(u => u.Adapt<GetUserDto>()).ToList();

        return new ApiResponse<List<GetUserDto>>()
        {
            Success = true,
            Payload = userDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetUserDto>> GetLoggedInUser(Guid userId)
    {
        var user = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "User Not Found",
                Payload = null
            };
        }

        var userDto = user.Adapt<GetUserDto>();
        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = userDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetUserDto>> GetUserById(Guid userId)
    {
        var user = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(id => id.Id == userId);
        if (user == null)
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "Not Found",
                Payload = null
            };
        }
        var userDto = user.Adapt<GetUserDto>();
        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = userDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetUserDto>> GetUserByEmail(string email)
    {
        var user = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(e => e.Email == email);
        if (user == null)
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                ErrorMessage = "Not Found",
                Payload = null
            };
        }
        var userDto = user.Adapt<GetUserDto>();
        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = userDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetUserDto>> UpdateUser(UpdateUserDto updatedUser)
    {
        var existingUser = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(u => u.Id == updatedUser.Id);

        if (existingUser == null)
        {
            return new ApiResponse<GetUserDto>()
            {
                Success = false,
                Payload = null,
                ErrorMessage = "User not found"
            };
        }

        existingUser.FirstName = updatedUser.FirstName ?? existingUser.FirstName;
        existingUser.LastName = updatedUser.LastName ?? existingUser.LastName;
        existingUser.Email = updatedUser.Email ?? existingUser.Email;
        existingUser.UpdatedAt = DateTime.Now;

        _context.Users.Update(existingUser);

        await _context.SaveChangesAsync();

        var user = existingUser.Adapt<GetUserDto>();

        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = user,
            ErrorMessage = null
        };
    }

    public async Task DeleteUser(Guid userId)
    {
        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (dbUser == null)
        {
            throw new Exception("User not found");
        }
        _context.Users.Remove(dbUser);
        await _context.SaveChangesAsync();
    }

}