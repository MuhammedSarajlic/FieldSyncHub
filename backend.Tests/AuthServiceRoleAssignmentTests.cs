using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.AuthService;
using backend.Services.EmailService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// Login/Register/LoginWithGoogle used to hand-build the response DTO and never set
/// Role or Workspace, so every token carried UserRole.Owner (enum value 0) and an
/// empty workspaceId claim regardless of the user's actual role. These tests pin the
/// DTO returned by AuthService to the user's real, persisted Role and Workspace.
/// </summary>
public class AuthServiceRoleAssignmentTests
{
    private static AuthService CreateService(DataContext context)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-1234",
                ["AppSettings:GoogleClientId"] = "test-client-id",
            })
            .Build();

        var emailService = new NoopEmailService();
        return new AuthService(context, configuration, emailService);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task Login_returns_the_users_actual_role_and_workspace()
    {
        await using var context = CreateContext();

        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "employee@acme.test",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1"),
            FirstName = "Jamie",
            LastName = "Doe",
            Role = UserRole.Employee,
            WorkspaceId = workspace.Id,
            Workspace = workspace
        };
        context.Workspaces.Add(workspace);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var authService = CreateService(context);
        var result = await authService.Login(new UserLoginDto { Email = user.Email, Password = "Password1" });

        Assert.True(result.Success);
        Assert.Equal(UserRole.Employee, result.Payload!.Role);
        Assert.NotNull(result.Payload.Workspace);
        Assert.Equal(workspace.Id, result.Payload.Workspace!.Id);
    }

    [Fact]
    public async Task Register_returns_owner_role_for_a_brand_new_self_registered_user()
    {
        await using var context = CreateContext();
        var authService = CreateService(context);

        var result = await authService.Register(new UserRegisterDto
        {
            FirstName = "New",
            LastName = "Owner",
            Email = "owner@acme.test",
            Password = "Password1"
        });

        Assert.True(result.Success);
        Assert.Equal(UserRole.Owner, result.Payload!.Role);
        Assert.Null(result.Payload.Workspace);
    }

    private sealed class NoopEmailService : IEmailService
    {
        public bool IsConfigured => false;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => Task.FromResult(EmailSendResult.Ok);

        public Task<EmailSendResult> SendEmailAsync(
            IEnumerable<string> toEmails,
            string subject,
            string plainTextContent,
            string htmlContent,
            IEnumerable<EmailAttachment>? attachments = null)
            => Task.FromResult(EmailSendResult.Ok);
    }
}
