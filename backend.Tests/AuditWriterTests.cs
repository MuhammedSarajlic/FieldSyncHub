using backend.Data;
using backend.Models;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

/// <summary>
/// ActivityHistory used to be bolted to Quote only, written by hand at a handful of
/// call sites - every other entity had no audit trail at all. DataContext now
/// collects an audit row from the change tracker on every SaveChanges for a fixed
/// list of business entities, so "who deleted this invoice" has an answer without
/// relying on every service remembering to write one.
/// </summary>
public class AuditWriterTests
{
    private static DataContext CreateContext(Guid? userId, Guid? workspaceId = null)
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options, new FakeCurrentUser { UserId = userId, WorkspaceId = workspaceId });
    }

    [Fact]
    public async Task Creating_an_audited_entity_writes_a_Created_row()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);

        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var row = await context.ActivityHistorys.SingleAsync(a => a.EntityId == customer.Id);
        Assert.Equal("Created", row.Type);
        Assert.Equal(nameof(Customer), row.EntityType);
        Assert.Equal(actorId, row.ChangedBy);
        Assert.Equal(workspaceId, row.WorkspaceId);
    }

    [Fact]
    public async Task Updating_an_audited_entity_writes_an_Updated_row_naming_the_changed_fields()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        customer.FirstName = "Changed";
        await context.SaveChangesAsync();

        var row = await context.ActivityHistorys
            .Where(a => a.EntityId == customer.Id && a.Type == "Updated")
            .SingleAsync();
        Assert.Contains("FirstName", row.Action);
    }

    [Fact]
    public async Task Touching_an_entity_without_changing_any_real_field_writes_nothing()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        var countAfterCreate = await context.ActivityHistorys.CountAsync();

        customer.UpdatedAt = DateTime.UtcNow.AddSeconds(1);
        await context.SaveChangesAsync();

        Assert.Equal(countAfterCreate, await context.ActivityHistorys.CountAsync());
    }

    [Fact]
    public async Task Deleting_an_audited_entity_writes_a_Deleted_row_with_the_records_id_intact()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        var customerId = customer.Id;

        context.Customers.Remove(customer);
        await context.SaveChangesAsync();

        // "Who deleted this" must still be answerable after the record is gone.
        Assert.False(await context.Customers.AnyAsync(c => c.Id == customerId));
        var row = await context.ActivityHistorys
            .Where(a => a.EntityId == customerId && a.Type == "Deleted")
            .SingleAsync();
        Assert.Equal(actorId, row.ChangedBy);
    }

    [Fact]
    public async Task Sensitive_fields_are_named_but_redacted_never_valued()
    {
        var actorId = Guid.NewGuid();
        await using var context = CreateContext(actorId);
        var user = new User { Id = Guid.NewGuid(), Email = "a@acme.test", FirstName = "A", LastName = "B", PasswordHash = "old-hash" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        user.PasswordHash = "new-hash";
        await context.SaveChangesAsync();

        var row = await context.ActivityHistorys
            .Where(a => a.EntityId == user.Id && a.Type == "Updated")
            .SingleAsync();
        Assert.Contains("PasswordHash (redacted)", row.Action);
        Assert.DoesNotContain("old-hash", row.Action);
        Assert.DoesNotContain("new-hash", row.Action);
    }

    [Fact]
    public async Task An_entity_outside_the_audited_list_writes_nothing()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        // RefreshToken churns on every login/refresh - auditing it would flood the
        // log with noise rather than business-meaningful events.
        context.RefreshTokens.Add(new RefreshToken { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), ExpiresAt = DateTime.UtcNow.AddDays(1) });
        await context.SaveChangesAsync();

        Assert.False(await context.ActivityHistorys.AnyAsync(a => a.EntityType == nameof(RefreshToken)));
    }

    [Fact]
    public async Task With_no_ambient_actor_nothing_is_written()
    {
        // Migrations, seed code, and most unit tests build a DataContext with no
        // current user - an audit row with no "who" would be noise, not evidence.
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(userId: null, workspaceId: workspaceId);

        context.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" });
        await context.SaveChangesAsync();

        Assert.Equal(0, await context.ActivityHistorys.CountAsync());
    }

    [Fact]
    public async Task WorkspaceId_is_taken_from_the_records_own_column_not_the_actors_claim()
    {
        var actorId = Guid.NewGuid();
        var actorWorkspaceId = Guid.NewGuid();
        var recordWorkspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, actorWorkspaceId);

        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = recordWorkspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        // Deliberately mismatched workspaces to isolate the write-time choice from
        // the read-time filter (which is scoped to the actor's own claim, and would
        // otherwise hide the very row this test is checking).
        var row = await context.ActivityHistorys.IgnoreQueryFilters().SingleAsync(a => a.EntityId == customer.Id);
        Assert.Equal(recordWorkspaceId, row.WorkspaceId);
    }
}
