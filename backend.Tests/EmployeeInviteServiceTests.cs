using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.EmployeeInviteService;
using backend.Services.TokenService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// AcceptInviteAsync used to hardcode Role = UserRole.Employee, ignoring whatever role
/// the invite was actually created with. These tests pin the new user's role to the
/// invite's stored Role.
/// </summary>
public class EmployeeInviteServiceTests
{
    private static EmployeeInviteService CreateService(DataContext context)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "test-signing-key-test-signing-key-test-signing-key-test-signing-key-1234",
                ["AppSettings:FrontendUrl"] = "http://localhost:5173",
            })
            .Build();

        var tokenService = new TokenService(configuration, new HttpContextAccessor { HttpContext = new DefaultHttpContext() });
        return new EmployeeInviteService(context, new NoopEmailService(), tokenService, configuration);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task AcceptInvite_assigns_the_role_the_invite_was_created_with()
    {
        await using var context = CreateContext();
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        var invite = new EmployeeInvite
        {
            Id = Guid.NewGuid(),
            Email = "newadmin@acme.test",
            WorkspaceId = workspace.Id,
            Token = "test-token",
            Role = UserRole.Admin,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        context.Workspaces.Add(workspace);
        context.EmployeeInvites.Add(invite);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var accessToken = await service.AcceptInviteAsync(invite.Token, new UserRegisterDto
        {
            FirstName = "New",
            LastName = "Admin",
            Email = invite.Email,
            Password = "Password1"
        });

        Assert.NotNull(accessToken);
        var createdUser = await context.Users.SingleAsync(u => u.Email == invite.Email);
        Assert.Equal(UserRole.Admin, createdUser.Role);
    }

    [Fact]
    public async Task AcceptInvite_defaults_to_employee_when_the_invite_was_never_assigned_a_role()
    {
        await using var context = CreateContext();
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        var invite = new EmployeeInvite
        {
            Id = Guid.NewGuid(),
            Email = "newemployee@acme.test",
            WorkspaceId = workspace.Id,
            Token = "test-token-2",
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        context.Workspaces.Add(workspace);
        context.EmployeeInvites.Add(invite);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        await service.AcceptInviteAsync(invite.Token, new UserRegisterDto
        {
            FirstName = "New",
            LastName = "Employee",
            Email = invite.Email,
            Password = "Password1"
        });

        var createdUser = await context.Users.SingleAsync(u => u.Email == invite.Email);
        Assert.Equal(UserRole.Employee, createdUser.Role);
    }

    [Fact]
    public async Task SendInvite_generates_a_url_safe_token()
    {
        // Convert.ToBase64String emits '+', '/', and '=' - dropped unencoded into a
        // query string, '+' decodes back as a space and corrupts the link for a large
        // share of tokens. The token must only contain URL-safe characters.
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.SendInvite("newhire@acme.test", Guid.NewGuid());

        var invite = await context.EmployeeInvites.SingleAsync(i => i.Email == "newhire@acme.test");
        Assert.DoesNotContain('+', invite.Token);
        Assert.DoesNotContain('/', invite.Token);
        Assert.DoesNotContain('=', invite.Token);
    }

    [Fact]
    public async Task AcceptInvite_sets_the_workspace_navigation_explicitly()
    {
        // The token returned depends on newUser.Workspace being populated when
        // Adapt<GetUserDto>() runs; this must not depend on EF's relationship fixup
        // from workspace.Users.Add(newUser) having already run.
        await using var context = CreateContext();
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        var invite = new EmployeeInvite
        {
            Id = Guid.NewGuid(),
            Email = "newhire@acme.test",
            WorkspaceId = workspace.Id,
            Token = "test-token-3",
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        context.Workspaces.Add(workspace);
        context.EmployeeInvites.Add(invite);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var accessToken = await service.AcceptInviteAsync(invite.Token, new UserRegisterDto
        {
            FirstName = "New",
            LastName = "Hire",
            Email = invite.Email,
            Password = "Password1"
        });

        Assert.NotNull(accessToken);

        var claims = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(accessToken);
        var workspaceIdClaim = claims.Claims.First(c => c.Type == "workspaceId").Value;
        Assert.Equal(workspace.Id.ToString(), workspaceIdClaim);
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
