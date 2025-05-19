using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace backend.Services.EmployeeInviteService
{
    public class EmployeeInviteService : IEmployeeInviteService
    {
        private const string ApiKey = "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";
        private const string SenderEmail = "invmansis@gmail.com";
        private const string SenderName = "FieldSyncHub";
        private readonly DataContext _context;
        public EmployeeInviteService(DataContext context)
        {
            _context = context;
        }
        public async Task<bool> AcceptInviteAsync(string token, UserLoginDto user)
        {
            var invite = await _context.EmployeeInvites.FirstOrDefaultAsync(i => i.Token == token);
            if (invite == null || invite.IsAccepted || invite.ExpiresAt < DateTime.UtcNow)
            {
                Console.WriteLine("1");
                return false;
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == invite.Email);
            Console.WriteLine(existingUser);
            if (existingUser != null)
            {
                return false;
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
                
            };
            _context.Users.Add(newUser);
            
            var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == invite.WorkspaceId);
            if (workspace == null)
            {
                Console.WriteLine("3");
                return false;
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

            return true;
        }


        public async Task<EmployeeInvite> CreateInviteAsync(string email, Guid workspaceId, string role)
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var invite = new EmployeeInvite
            {
                Id = Guid.NewGuid(),
                Email = email,
                WorkspaceId = workspaceId,
                Role = role,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(48)
            };
            _context.EmployeeInvites.Add(invite);
            await _context.SaveChangesAsync();

            return invite;
        }

        public async Task SendInvite(string email, Guid workspaceId)
        {
            var client = new SendGridClient(ApiKey);
            var from = new EmailAddress(SenderEmail, SenderName);
            var to = new EmailAddress(email, "User");
            var subject = "You're Invited to Join a Workspace!";
            var plainTextContent = $"You have been invited to join the workspace with ID: {workspaceId}. Visit https://yourdomain.com/accept-invite/{workspaceId} to accept the invitation.";
            var htmlContent = $@"
                <html>
                <body>
                    <h1>Workspace Invitation</h1>
                    <p>You have been invited to join the workspace with ID: <strong>{workspaceId}</strong>.</p>
                    <p>Click here to accept the invitation.</p>
                </body>
                </html>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            var response = await client.SendEmailAsync(msg);

            if (response.StatusCode != System.Net.HttpStatusCode.Accepted &&
                response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                var errorBody = await response.Body.ReadAsStringAsync();
                Console.WriteLine($"Failed to send invite. Status: {response.StatusCode}, Body: {errorBody}");
                throw new Exception($"SendGrid API returned error: {response.StatusCode}");
            }
            else
            {
                Console.WriteLine("Invitation email sent successfully.");
            }
        }

        public async Task<EmployeeInvite?> ValidateInviteTokenAsync(string token)
        {
            return await _context.EmployeeInvites.FirstOrDefaultAsync(i => i.Token == token && i.ExpiresAt > DateTime.UtcNow && !i.IsAccepted);
        }
    }
}
