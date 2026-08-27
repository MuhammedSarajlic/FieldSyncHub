using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.UserService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace backend.Tests;

/// <summary>
/// PUT /api/user used to change any user's email by id with no verification, and
/// DELETE /api/user/{id} removed any account with no auth at all. These tests pin the
/// service-level fix: editing always targets the caller (never a body-supplied id),
/// an email change is deferred behind a confirmation link rather than applied
/// immediately, and a delete is rejected across workspace boundaries.
/// </summary>
public class UserServiceTests
{
    private static UserService CreateService(DataContext context)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:FrontendUrl"] = "http://localhost:5173",
            })
            .Build();
        return new UserService(context, new NoopEmailService(), configuration);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task UpdateUser_ignores_the_id_in_the_body_and_only_ever_edits_the_caller()
    {
        await using var context = CreateContext();
        var caller = new User { Id = Guid.NewGuid(), Email = "caller@acme.test", FirstName = "A", LastName = "B" };
        var victim = new User { Id = Guid.NewGuid(), Email = "victim@acme.test", FirstName = "C", LastName = "D" };
        context.Users.AddRange(caller, victim);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        await service.UpdateUser(caller.Id, new UpdateUserDto { Id = victim.Id, FirstName = "Changed" });

        var reloadedVictim = await context.Users.SingleAsync(u => u.Id == victim.Id);
        var reloadedCaller = await context.Users.SingleAsync(u => u.Id == caller.Id);
        Assert.Equal("C", reloadedVictim.FirstName);
        Assert.Equal("Changed", reloadedCaller.FirstName);
    }

    [Fact]
    public async Task UpdateUser_does_not_change_the_email_immediately()
    {
        await using var context = CreateContext();
        var caller = new User { Id = Guid.NewGuid(), Email = "old@acme.test", FirstName = "A", LastName = "B" };
        context.Users.Add(caller);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.UpdateUser(caller.Id, new UpdateUserDto { Id = caller.Id, Email = "new@acme.test" });

        Assert.True(result.Success);
        var reloaded = await context.Users.SingleAsync(u => u.Id == caller.Id);
        Assert.Equal("old@acme.test", reloaded.Email);
        Assert.Equal("new@acme.test", reloaded.PendingEmail);
        Assert.NotNull(reloaded.EmailChangeToken);
        Assert.NotNull(reloaded.EmailChangeTokenExpiresAt);
    }

    [Fact]
    public async Task UpdateUser_rejects_an_email_already_taken_by_another_user()
    {
        await using var context = CreateContext();
        var caller = new User { Id = Guid.NewGuid(), Email = "caller@acme.test", FirstName = "A", LastName = "B" };
        var other = new User { Id = Guid.NewGuid(), Email = "taken@acme.test", FirstName = "C", LastName = "D" };
        context.Users.AddRange(caller, other);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.UpdateUser(caller.Id, new UpdateUserDto { Id = caller.Id, Email = "taken@acme.test" });

        Assert.False(result.Success);
        var reloaded = await context.Users.SingleAsync(u => u.Id == caller.Id);
        Assert.Equal("caller@acme.test", reloaded.Email);
    }

    [Fact]
    public async Task ConfirmEmailChange_applies_the_pending_email_for_a_valid_token()
    {
        await using var context = CreateContext();
        var caller = new User { Id = Guid.NewGuid(), Email = "old@acme.test", FirstName = "A", LastName = "B" };
        context.Users.Add(caller);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        await service.UpdateUser(caller.Id, new UpdateUserDto { Id = caller.Id, Email = "new@acme.test" });
        var token = (await context.Users.SingleAsync(u => u.Id == caller.Id)).EmailChangeToken!;

        var result = await service.ConfirmEmailChangeAsync(token);

        Assert.True(result.Success);
        var reloaded = await context.Users.SingleAsync(u => u.Id == caller.Id);
        Assert.Equal("new@acme.test", reloaded.Email);
        Assert.Null(reloaded.PendingEmail);
        Assert.Null(reloaded.EmailChangeToken);
    }

    [Fact]
    public async Task ConfirmEmailChange_rejects_an_address_taken_since_the_change_was_requested()
    {
        // Uniqueness was only checked when the change was requested, not when it's
        // confirmed - two users could both start a change to the same address and
        // both confirm. Simulate the second confirmer losing the race.
        await using var context = CreateContext();
        var first = new User
        {
            Id = Guid.NewGuid(),
            Email = "first@acme.test",
            FirstName = "A",
            LastName = "B",
            PendingEmail = "shared@acme.test",
            EmailChangeToken = "token-first",
            EmailChangeTokenExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        var second = new User
        {
            Id = Guid.NewGuid(),
            Email = "second@acme.test",
            FirstName = "C",
            LastName = "D",
            PendingEmail = "shared@acme.test",
            EmailChangeToken = "token-second",
            EmailChangeTokenExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        context.Users.AddRange(first, second);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var firstResult = await service.ConfirmEmailChangeAsync("token-first");
        var secondResult = await service.ConfirmEmailChangeAsync("token-second");

        Assert.True(firstResult.Success);
        Assert.False(secondResult.Success);

        var reloadedSecond = await context.Users.SingleAsync(u => u.Id == second.Id);
        Assert.Equal("second@acme.test", reloadedSecond.Email);
    }

    [Fact]
    public async Task ConfirmEmailChange_rejects_an_expired_token()
    {
        await using var context = CreateContext();
        var caller = new User
        {
            Id = Guid.NewGuid(),
            Email = "old@acme.test",
            FirstName = "A",
            LastName = "B",
            PendingEmail = "new@acme.test",
            EmailChangeToken = "expired-token",
            EmailChangeTokenExpiresAt = DateTime.UtcNow.AddHours(-1)
        };
        context.Users.Add(caller);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.ConfirmEmailChangeAsync("expired-token");

        Assert.False(result.Success);
        var reloaded = await context.Users.SingleAsync(u => u.Id == caller.Id);
        Assert.Equal("old@acme.test", reloaded.Email);
    }

    [Fact]
    public async Task DeleteUser_throws_when_the_target_is_in_a_different_workspace()
    {
        await using var context = CreateContext();
        var workspaceA = Guid.NewGuid();
        var workspaceB = Guid.NewGuid();
        var target = new User { Id = Guid.NewGuid(), Email = "target@acme.test", FirstName = "A", LastName = "B", WorkspaceId = workspaceB };
        context.Users.Add(target);
        await context.SaveChangesAsync();

        var service = CreateService(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.DeleteUser(target.Id, workspaceA));

        Assert.True(await context.Users.AnyAsync(u => u.Id == target.Id));
    }

    [Fact]
    public async Task DeleteUser_succeeds_within_the_same_workspace()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var target = new User { Id = Guid.NewGuid(), Email = "target@acme.test", FirstName = "A", LastName = "B", WorkspaceId = workspaceId };
        context.Users.Add(target);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        await service.DeleteUser(target.Id, workspaceId);

        Assert.False(await context.Users.AnyAsync(u => u.Id == target.Id));
    }

    [Fact]
    public async Task DeleteUser_throws_when_deleting_the_only_owner_of_a_workspace()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var onlyOwner = new User { Id = Guid.NewGuid(), Email = "owner@acme.test", FirstName = "A", LastName = "B", WorkspaceId = workspaceId, Role = UserRole.Owner };
        context.Users.Add(onlyOwner);
        await context.SaveChangesAsync();

        var service = CreateService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteUser(onlyOwner.Id, workspaceId));

        Assert.True(await context.Users.AnyAsync(u => u.Id == onlyOwner.Id));
    }

    [Fact]
    public async Task DeleteUser_allows_deleting_an_owner_when_another_owner_remains()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var owner1 = new User { Id = Guid.NewGuid(), Email = "owner1@acme.test", FirstName = "A", LastName = "B", WorkspaceId = workspaceId, Role = UserRole.Owner };
        var owner2 = new User { Id = Guid.NewGuid(), Email = "owner2@acme.test", FirstName = "C", LastName = "D", WorkspaceId = workspaceId, Role = UserRole.Owner };
        context.Users.AddRange(owner1, owner2);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        await service.DeleteUser(owner1.Id, workspaceId);

        Assert.False(await context.Users.AnyAsync(u => u.Id == owner1.Id));
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
