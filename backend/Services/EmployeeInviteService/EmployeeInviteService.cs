using System.Security.Cryptography;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.TokenService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.EmployeeInviteService
{
    public class EmployeeInviteService : IEmployeeInviteService
    {
        private const string ApiKey = "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";
        private const string SenderEmail = "invmansis@gmail.com";
        private const string SenderName = "FieldSyncHub";
        private readonly DataContext _context;
        private readonly IEmailService _emailService;
        private readonly ITokenService _tokenService;
        public EmployeeInviteService(DataContext context, IEmailService emailService, ITokenService tokenService)
        {
            _context = context;
            _emailService = emailService;
            _tokenService = tokenService;
        }
        public async Task<string?> AcceptInviteAsync(string token, UserLoginDto user)
        {
            var invite = await _context.EmployeeInvites.FirstOrDefaultAsync(i => i.Token == token);
            if (invite == null || invite.IsAccepted || invite.ExpiresAt < DateTime.UtcNow)
            {
                return null;
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == invite.Email);
            if (existingUser != null)
            {
                return null;
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
                Role = UserRole.Employee,
                WorkspaceId = invite.WorkspaceId
            };
            _context.Users.Add(newUser);

            var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == invite.WorkspaceId);
            if (workspace == null)
            {
                return null;
            }

            if (!workspace.Users.Contains(newUser.Id.ToString()))
                workspace.Users.Add(newUser.Id.ToString());

            invite.IsAccepted = true;

            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                UserId = newUser.Id,
                WorkspaceId = invite.WorkspaceId,
                HireDate = DateTime.UtcNow
            };
            _context.Employees.Add(employee);

            await _context.SaveChangesAsync();

            var newuser = newUser.Adapt<UserDto>();  

            var tokens = _tokenService.GenerateTokens(newuser);
            _tokenService.SetRefreshTokenCookie(tokens.refreshToken);

            return tokens.accessToken;
        }


        public async Task SendInvite(string email, Guid workspaceId)
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var invite = new EmployeeInvite
            {
                Id = Guid.NewGuid(),
                Email = email,
                WorkspaceId = workspaceId,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(48)
            };

            _context.EmployeeInvites.Add(invite);
            await _context.SaveChangesAsync();

            var subject = "You're Invited to Join a Workspace!";
            var plainText = $"You have been invited to join the workspace with ID: {workspaceId}. Visit: http://localhost:5173/invite?token={token}";
            var html = $@"
        <html>
        <body>
            <h1>Workspace Invitation</h1>
            <p>You have been invited to join the workspace with ID: <strong>{workspaceId}</strong>.</p>
            <p>Click here to accept the invitation:</p>
            <a href='http://localhost:5173/invite?token={token}'>Accept Invitation</a>
        </body>
        </html>";

            var emailSent = await _emailService.SendEmailAsync(email, subject, plainText, html);

            if (!emailSent)
            {
                throw new Exception("Failed to send invitation email.");
            }
        }


        public async Task<EmployeeInvite?> ValidateInviteTokenAsync(string token)
        {
            return await _context.EmployeeInvites.Where(i => i.Token == token && i.ExpiresAt > DateTime.UtcNow && !i.IsAccepted)
                                                .Include(i => i.Workspace)
                                                .FirstOrDefaultAsync();
        }
    }
}
