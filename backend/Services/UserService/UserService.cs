using System.Security.Cryptography;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.EmailService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.UserService;

public class UserService : IUserService
{
    private readonly DataContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public UserService(DataContext context, IEmailService emailService, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
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

    public async Task<ApiResponse<GetUserDto>> UpdateUser(Guid callerId, UpdateUserDto updatedUser)
    {
        // Callers may only edit themselves - the id in the request body is ignored.
        var existingUser = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(u => u.Id == callerId);

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

        var emailChangePending = false;
        if (!string.IsNullOrWhiteSpace(updatedUser.Email) &&
            !string.Equals(updatedUser.Email, existingUser.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailTaken = await _context.Users.AnyAsync(u => u.Id != existingUser.Id && u.Email == updatedUser.Email);
            if (emailTaken)
            {
                return new ApiResponse<GetUserDto>
                {
                    Success = false,
                    Payload = null,
                    ErrorMessage = "That email is already in use."
                };
            }

            // The address itself isn't changed here - it only takes effect once the
            // confirmation link (sent to both the old and new address) is clicked.
            await BeginEmailChangeAsync(existingUser, updatedUser.Email);
            emailChangePending = true;
        }

        existingUser.UpdatedAt = DateTime.Now;

        _context.Users.Update(existingUser);

        await _context.SaveChangesAsync();

        var user = existingUser.Adapt<GetUserDto>();

        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = user,
            ErrorMessage = emailChangePending
                ? "Check your new email address for a link to confirm the change."
                : null
        };
    }

    public async Task<ApiResponse<string>> ConfirmEmailChangeAsync(string token)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailChangeToken == token);

        if (user == null || string.IsNullOrEmpty(user.PendingEmail) ||
            user.EmailChangeTokenExpiresAt == null || user.EmailChangeTokenExpiresAt < DateTime.UtcNow)
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "This email confirmation link is invalid or has expired.",
                Payload = null
            };
        }

        user.Email = user.PendingEmail;
        user.PendingEmail = null;
        user.EmailChangeToken = null;
        user.EmailChangeTokenExpiresAt = null;
        user.UpdatedAt = DateTime.Now;
        await _context.SaveChangesAsync();

        return new ApiResponse<string>
        {
            Success = true,
            ErrorMessage = "",
            Payload = "Email address updated."
        };
    }

    public async Task DeleteUser(Guid userId, Guid callerWorkspaceId)
    {
        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (dbUser == null)
        {
            throw new Exception("User not found");
        }
        if (dbUser.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That user is not in your workspace.");
        }
        _context.Users.Remove(dbUser);
        await _context.SaveChangesAsync();
    }

    private async Task BeginEmailChangeAsync(User user, string newEmail)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
        user.PendingEmail = newEmail;
        user.EmailChangeToken = token;
        user.EmailChangeTokenExpiresAt = DateTime.UtcNow.AddHours(1);

        var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173";
        var confirmLink = $"{frontendUrl}/confirm-email-change?token={token}";
        var oldEmail = user.Email;

        var newAddressHtml = $"<p>Confirm your new email address for your FieldSyncHub account.</p>" +
                   $"<p><a href=\"{confirmLink}\">Confirm email change</a></p>" +
                   $"<p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>";
        var newAddressText = $"Confirm your new FieldSyncHub email: {confirmLink} (expires in 1 hour)";

        var oldAddressHtml = $"<p>Someone requested to change the email on your FieldSyncHub account from {oldEmail} to {newEmail}.</p>" +
                   $"<p><a href=\"{confirmLink}\">Confirm email change</a></p>" +
                   $"<p>This link expires in 1 hour. If you didn't request this, you can ignore this email and your address will stay the same.</p>";
        var oldAddressText = $"Someone requested to change your FieldSyncHub email to {newEmail}. Confirm: {confirmLink} (expires in 1 hour). If this wasn't you, ignore this email.";

        try
        {
            await _emailService.SendEmailAsync(newEmail, "Confirm your new FieldSyncHub email", newAddressText, newAddressHtml);
            await _emailService.SendEmailAsync(oldEmail, "Your FieldSyncHub email is changing", oldAddressText, oldAddressHtml);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email-change confirmation for {oldEmail}: {ex.Message}");
        }
    }

}