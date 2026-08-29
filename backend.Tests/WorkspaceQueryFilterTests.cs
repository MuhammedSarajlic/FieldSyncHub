using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

/// <summary>
/// SEC-03 relied entirely on every service remembering to add a .Where(WorkspaceId ==
/// ...) clause - a forgotten one in a new query would silently leak another tenant's
/// rows. DataContext now applies a global HasQueryFilter for every tenant-scoped
/// DbSet, keyed off ICurrentUser.WorkspaceId, so that mistake can no longer happen:
/// a query with no explicit workspace filter at all still only sees the caller's own
/// data. These pin that behavior directly, plus the two escape hatches that must keep
/// working: no ambient user at all (migrations, background code, most unit tests)
/// leaves queries unfiltered, and .IgnoreQueryFilters() lets deliberately
/// cross-tenant code (an eventual admin portal, a background worker) opt back out.
/// </summary>
public class WorkspaceQueryFilterTests
{
    private sealed class FakeCurrentUser : ICurrentUser
    {
        public Guid? UserId => null;
        public Guid? WorkspaceId { get; init; }
        public UserRole? Role => null;
    }

    [Fact]
    public async Task A_query_with_no_explicit_workspace_filter_still_only_sees_the_callers_own_workspace()
    {
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using (var seedContext = new DataContext(options))
        {
            seedContext.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = ownWorkspace, FirstName = "Own", LastName = "Customer" });
            seedContext.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, FirstName = "Other", LastName = "Customer" });
            await seedContext.SaveChangesAsync();
        }

        await using var scopedContext = new DataContext(options, new FakeCurrentUser { WorkspaceId = ownWorkspace });

        var visible = await scopedContext.Customers.ToListAsync();

        Assert.Single(visible);
        Assert.Equal(ownWorkspace, visible[0].WorkspaceId);
    }

    [Fact]
    public async Task IgnoreQueryFilters_still_exposes_every_workspaces_rows()
    {
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using (var seedContext = new DataContext(options))
        {
            seedContext.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = ownWorkspace, FirstName = "Own", LastName = "Customer" });
            seedContext.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, FirstName = "Other", LastName = "Customer" });
            await seedContext.SaveChangesAsync();
        }

        await using var scopedContext = new DataContext(options, new FakeCurrentUser { WorkspaceId = ownWorkspace });

        var filtered = await scopedContext.Customers.ToListAsync();
        var unfiltered = await scopedContext.Customers.IgnoreQueryFilters().ToListAsync();

        Assert.Single(filtered);
        Assert.Equal(2, unfiltered.Count);
    }

    [Fact]
    public async Task No_ambient_user_leaves_queries_unfiltered()
    {
        // Migrations, seed code, and most unit tests build a DataContext with just
        // DbContextOptions - they must keep seeing everything, not silently nothing.
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var context = new DataContext(options);

        context.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = Guid.NewGuid(), FirstName = "A", LastName = "B" });
        context.Customers.Add(new Customer { Id = Guid.NewGuid(), WorkspaceId = Guid.NewGuid(), FirstName = "C", LastName = "D" });
        await context.SaveChangesAsync();

        var all = await context.Customers.ToListAsync();

        Assert.Equal(2, all.Count);
    }
}
