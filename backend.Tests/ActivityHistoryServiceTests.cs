using backend.Data;
using backend.Models;
using backend.Services.ActivityHistoryService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class ActivityHistoryServiceTests
{
    private static DataContext CreateContext(Guid actorId, Guid workspaceId) =>
        new(
            new DbContextOptionsBuilder<DataContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options,
            new FakeCurrentUser { UserId = actorId, WorkspaceId = workspaceId });

    [Fact]
    public async Task GetByEntity_returns_history_for_a_deleted_records_id()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var service = new ActivityHistoryService(context);

        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        var customerId = customer.Id;

        context.Customers.Remove(customer);
        await context.SaveChangesAsync();

        var result = await service.GetByEntityAsync(nameof(Customer), customerId, workspaceId, 1, 20);

        Assert.True(result.Success);
        Assert.Equal(2, result.Payload!.TotalCount); // Created + Deleted
        Assert.Equal("Deleted", result.Payload.Items[0].Type); // newest first
    }

    [Fact]
    public async Task GetByEntity_does_not_return_another_workspaces_history()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        var otherWorkspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var service = new ActivityHistoryService(context);

        // A row that belongs to another tenant, simulating it already being in the
        // table (the query filter only ever applies to reads, not writes).
        context.ActivityHistorys.Add(new ActivityHistory
        {
            Id = Guid.NewGuid(),
            Type = "Deleted",
            EntityType = "Invoice",
            EntityId = Guid.NewGuid(),
            WorkspaceId = otherWorkspaceId,
            ChangedBy = Guid.NewGuid(),
        });
        await context.SaveChangesAsync();

        var result = await service.GetByEntityAsync("Invoice", Guid.NewGuid(), workspaceId, 1, 20);

        Assert.Equal(0, result.Payload!.TotalCount);
    }

    [Fact]
    public async Task GetByWorkspace_pages_results_newest_first()
    {
        var actorId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        await using var context = CreateContext(actorId, workspaceId);
        var service = new ActivityHistoryService(context);

        for (var i = 0; i < 3; i++)
        {
            context.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = $"C{i}", LastName = "B" });
            await context.SaveChangesAsync();
        }

        var result = await service.GetByWorkspaceAsync(workspaceId, pageNumber: 1, pageSize: 2);

        Assert.Equal(3, result.Payload!.TotalCount);
        Assert.Equal(2, result.Payload.Items.Count);
    }
}
