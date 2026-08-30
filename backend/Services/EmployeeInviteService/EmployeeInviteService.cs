using System.Security.Cryptography;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.TokenService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.EmployeeInviteService;

public class EmployeeInviteService : IEmployeeInviteService
{
    private readonly DataContext _context;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    public EmployeeInviteService(DataContext context, IEmailService emailService, ITokenService tokenService, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _tokenService = tokenService;
        _configuration = configuration;
    }
    public async Task<string?> AcceptInviteAsync(string token, UserRegisterDto user)
    {
        var invite = await _context.EmployeeInvites.FirstOrDefaultAsync(i => i.Token == token);
        if (invite == null || invite.IsAccepted || invite.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == invite.Email);
        if (existingUser != null)
        {
            var invitedWorkspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == invite.WorkspaceId);
            if (invitedWorkspace == null) return null;

            var membership = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == existingUser.Id && e.WorkspaceId == invite.WorkspaceId);
            if (membership == null)
            {
                await EnsureSeatAvailable(invite.WorkspaceId);
                _context.Employees.Add(new Employee
                {
                    Id = Guid.NewGuid(), UserId = existingUser.Id, WorkspaceId = invite.WorkspaceId,
                    HireDate = DateTime.UtcNow, Status = EmployeeStatus.Active
                });
            }

            var workspaceMembership = await _context.WorkspaceMemberships.FirstOrDefaultAsync(m => m.UserId == existingUser.Id && m.WorkspaceId == invite.WorkspaceId);
            if (workspaceMembership == null)
                _context.WorkspaceMemberships.Add(new WorkspaceMembership { Id = Guid.NewGuid(), UserId = existingUser.Id, WorkspaceId = invite.WorkspaceId, Role = invite.Role });
            else { workspaceMembership.Role = invite.Role; workspaceMembership.IsActive = true; workspaceMembership.UpdatedAt = DateTime.UtcNow; }

            existingUser.Role = invite.Role;
            existingUser.WorkspaceId = invite.WorkspaceId;
            existingUser.Workspace = invitedWorkspace;
            invite.IsAccepted = true;
            await _context.SaveChangesAsync();

            var existingUserDto = existingUser.Adapt<GetUserDto>();
            var (existingAccessToken, existingRefreshToken) = await _tokenService.GenerateTokensAsync(existingUserDto);
            _tokenService.SetRefreshTokenCookie(existingRefreshToken);
            return existingAccessToken;
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Email = invite.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Role = invite.Role,
            WorkspaceId = invite.WorkspaceId
        };
        _context.Users.Add(newUser);

        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == invite.WorkspaceId);
        if (workspace == null)
        {
            return null;
        }
        workspace.Users.Add(newUser);
        // Set explicitly rather than relying on EF's relationship fixup from the
        // Add above - the token below is generated from this object, and its
        // workspaceId claim must never end up empty because that link didn't happen
        // to run before Adapt<GetUserDto>() is called.
        newUser.Workspace = workspace;

        invite.IsAccepted = true;

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = newUser.Id,
            WorkspaceId = invite.WorkspaceId,
            HireDate = DateTime.UtcNow
        };
        _context.Employees.Add(employee);
        await EnsureSeatAvailable(invite.WorkspaceId);
        _context.WorkspaceMemberships.Add(new WorkspaceMembership { Id = Guid.NewGuid(), UserId = newUser.Id, WorkspaceId = invite.WorkspaceId, Role = invite.Role });

        await _context.SaveChangesAsync();

        var newuser = newUser.Adapt<GetUserDto>();
        var (accessToken, refreshToken) = await _tokenService.GenerateTokensAsync(newuser);
        _tokenService.SetRefreshTokenCookie(refreshToken);

        return accessToken;
    }

    public async Task SendInvite(string email, Guid workspaceId, UserRole role = UserRole.Employee)
    {
        await EnsureSeatAvailable(workspaceId);
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
        var invite = new EmployeeInvite
        {
            Id = Guid.NewGuid(),
            Email = email,
            WorkspaceId = workspaceId,
            Token = token,
            Role = role,
            ExpiresAt = DateTime.UtcNow.AddHours(48)
        };

        _context.EmployeeInvites.Add(invite);
        await _context.SaveChangesAsync();

        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == workspaceId)
            ?? throw new InvalidOperationException("Workspace not found.");
        var workspaceName = string.IsNullOrWhiteSpace(workspace.CompanyName) ? workspace.Name : workspace.CompanyName;
        var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173";
        var inviteLink = $"{frontendUrl}/invite?token={token}";
        var subject = "You're Invited to Join a Workspace!";
        var plainText = $"You have been invited to join {workspaceName}. Visit: {inviteLink}";
        var html = $@"
        <html>
        <body>
            <h1>Workspace Invitation</h1>
            <p>You have been invited to join <strong>{workspaceName}</strong>.</p>
            <p>Click here to accept the invitation:</p>
            <a href='{inviteLink}'>Accept Invitation</a>
        </body>
        </html>";

        var emailSent = await _emailService.SendEmailAsync(email, subject, plainText, html);

        if (!emailSent.Success)
        {
            throw new Exception($"Failed to send invitation email: {emailSent.Error}");
        }
    }

    private async Task EnsureSeatAvailable(Guid workspaceId)
    {
        var subscription = await _context.Subscriptions.FirstOrDefaultAsync(s => s.WorkspaceId == workspaceId);
        // Workspaces created before subscription billing was introduced have no
        // subscription row yet. Keep their existing invite flow working; once a
        // subscription exists, enforce its status and seat limit.
        if (subscription == null) return;
        if (subscription.Status is "Canceled" or "PastDue") throw new InvalidOperationException("An active subscription is required to add team members.");
        var activeSeats = await _context.Employees.CountAsync(e => e.WorkspaceId == workspaceId && e.Status != EmployeeStatus.Terminated && !e.IsArchived);
        if (activeSeats >= subscription.SeatCount) throw new InvalidOperationException("This workspace has reached its plan seat limit.");
    }


    public async Task<EmployeeInvite?> ValidateInviteTokenAsync(string token)
    {
        return await _context.EmployeeInvites.Where(i => i.Token == token && i.ExpiresAt > DateTime.UtcNow && !i.IsAccepted)
                                            .Include(i => i.Workspace)
                                            .FirstOrDefaultAsync();
    }

    public Task<List<EmployeeInvite>> GetPendingInvites(Guid workspaceId) =>
        _context.EmployeeInvites.Where(i => i.WorkspaceId == workspaceId && !i.IsAccepted && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt).ToListAsync();

    public async Task<bool> RevokeInvite(Guid id, Guid workspaceId)
    {
        var invite = await _context.EmployeeInvites.FirstOrDefaultAsync(i => i.Id == id && i.WorkspaceId == workspaceId && !i.IsAccepted);
        if (invite == null) return false;
        invite.IsAccepted = true;
        invite.ExpiresAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SendInviteAgain(Guid id, Guid workspaceId)
    {
        var invite = await _context.EmployeeInvites.FirstOrDefaultAsync(i => i.Id == id && i.WorkspaceId == workspaceId && !i.IsAccepted);
        if (invite == null) throw new KeyNotFoundException("Pending invite not found.");
        invite.ExpiresAt = DateTime.UtcNow.AddHours(48);
        invite.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await SendInvite(invite.Email, workspaceId, invite.Role);
    }
}
