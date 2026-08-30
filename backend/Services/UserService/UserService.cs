using System.Security.Cryptography;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.EmailService;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Services.UserService;

public class UserService : IUserService
{
    private readonly DataContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserService> _logger;

    public UserService(DataContext context, IEmailService emailService, IConfiguration configuration, ILogger<UserService>? logger = null)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger ?? NullLogger<UserService>.Instance;
    }

    public async Task<ApiResponse<GetUserDto>> GetLoggedInUser(Guid userId)
    {
        var user = await _context.Users.IgnoreQueryFilters().Include(u => u.Workspace).Include(u => u.WorkspaceMemberships).ThenInclude(m => m.Workspace).FirstOrDefaultAsync(u => u.Id == userId);

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
        userDto.Workspaces = user.WorkspaceMemberships.Where(m => m.IsActive && m.Workspace != null).Select(m => new UserWorkspaceDto { Id = m.WorkspaceId, Name = m.Workspace!.CompanyName ?? m.Workspace.Name, Role = m.Role }).ToList();
        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = userDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetUserDto>> GetUserById(Guid userId, Guid callerWorkspaceId)
    {
        var user = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(id => id.Id == userId);
        if (user == null || user.WorkspaceId != callerWorkspaceId)
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

    public async Task<ApiResponse<GetUserDto>> GetUserByEmail(string email, Guid callerWorkspaceId)
    {
        var user = await _context.Users.Include(u => u.Workspace).FirstOrDefaultAsync(e => e.Email == email);
        if (user == null || user.WorkspaceId != callerWorkspaceId)
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
        var emailChangeConfirmationSent = false;
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
            emailChangeConfirmationSent = await BeginEmailChangeAsync(existingUser, updatedUser.Email);
            emailChangePending = true;
        }

        existingUser.UpdatedAt = DateTime.Now;

        _context.Users.Update(existingUser);

        await _context.SaveChangesAsync();

        var user = existingUser.Adapt<GetUserDto>();

        string? emailChangeMessage = null;
        if (emailChangePending)
        {
            emailChangeMessage = emailChangeConfirmationSent
                ? "Check your new email address for a link to confirm the change."
                : "Your name was updated, but the confirmation email couldn't be sent - try changing your email again shortly.";
        }

        return new ApiResponse<GetUserDto>()
        {
            Success = true,
            Payload = user,
            ErrorMessage = emailChangeMessage
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

        // Re-check uniqueness here, not just when the change was requested - another
        // user could have started (and confirmed) a change to the same address in the
        // meantime.
        var emailTakenSinceRequested = await _context.Users
            .AnyAsync(u => u.Id != user.Id && u.Email == user.PendingEmail);
        if (emailTakenSinceRequested)
        {
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "That email is already in use.",
                Payload = null
            };
        }

        user.Email = user.PendingEmail;
        user.PendingEmail = null;
        user.EmailChangeToken = null;
        user.EmailChangeTokenExpiresAt = null;
        user.UpdatedAt = DateTime.Now;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // The AnyAsync check above can't close a true race between two concurrent
            // confirmations - the unique index on Users.Email is the actual guarantee,
            // and violating it lands here.
            return new ApiResponse<string>
            {
                Success = false,
                ErrorMessage = "That email is already in use.",
                Payload = null
            };
        }

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

        if (dbUser.Role == UserRole.Owner)
        {
            var otherOwnerExists = await _context.Users
                .AnyAsync(u => u.WorkspaceId == callerWorkspaceId && u.Id != dbUser.Id && u.Role == UserRole.Owner);
            if (!otherOwnerExists)
            {
                throw new InvalidOperationException("Cannot delete the only Owner of a workspace.");
            }
        }

        _context.Users.Remove(dbUser);
        await _context.SaveChangesAsync();
    }

    private async Task<bool> BeginEmailChangeAsync(User user, string newEmail)
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
            var newAddressResult = await _emailService.SendEmailAsync(newEmail, "Confirm your new FieldSyncHub email", newAddressText, newAddressHtml);
            var oldAddressResult = await _emailService.SendEmailAsync(oldEmail, "Your FieldSyncHub email is changing", oldAddressText, oldAddressHtml);

            if (!newAddressResult.Success)
            {
                _logger.LogWarning("Failed to send email-change confirmation to {Email}: {Error}", newEmail, newAddressResult.Error);
            }
            if (!oldAddressResult.Success)
            {
                _logger.LogWarning("Failed to send email-change notice to {Email}: {Error}", oldEmail, oldAddressResult.Error);
            }

            // The old-address notice is best-effort - what matters for the caller is
            // whether the link they need to click actually went out.
            return newAddressResult.Success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email-change confirmation for {Email}", oldEmail);
            return false;
        }
    }

}
