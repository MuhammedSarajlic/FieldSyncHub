using backend.Data;
using backend.Dtos.WorkspaceDto;
using backend.Models;
using backend.Services.WorkspaceService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

/// <summary>
/// WorkspaceController was completely unprotected: GetWorkspaceById/UpdateWorkspace
/// took the workspace id from the URL/body with no ownership check at all, and
/// DeleteWorkspace had neither an auth-role requirement nor a workspace check. These
/// tests pin the fix at the service layer: every operation is scoped to the caller's
/// own workspace regardless of what id is supplied.
/// </summary>
public class WorkspaceServiceTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task GetWorkspaceById_rejects_a_workspace_that_is_not_the_callers_own()
    {
        await using var context = CreateContext();
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        context.Workspaces.Add(workspace);
        await context.SaveChangesAsync();

        var service = new WorkspaceService(context, new NoopStorageService());
        var result = await service.GetWorkspaceById(workspace.Id, Guid.NewGuid());

        Assert.False(result.Success);
    }

    [Fact]
    public async Task GetWorkspaceById_allows_the_callers_own_workspace()
    {
        await using var context = CreateContext();
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        context.Workspaces.Add(workspace);
        await context.SaveChangesAsync();

        var service = new WorkspaceService(context, new NoopStorageService());
        var result = await service.GetWorkspaceById(workspace.Id, workspace.Id);

        Assert.True(result.Success);
    }

    [Fact]
    public async Task UpdateWorkspace_ignores_the_id_in_the_body_and_only_updates_the_callers_own()
    {
        await using var context = CreateContext();
        var caller = new Workspace { Id = Guid.NewGuid(), Name = "Mine" };
        var victim = new Workspace { Id = Guid.NewGuid(), Name = "TheirCompany" };
        context.Workspaces.AddRange(caller, victim);
        await context.SaveChangesAsync();

        var service = new WorkspaceService(context, new NoopStorageService());
        await service.UpdateWorkspace(new UpdateWorkspaceDto { Id = victim.Id, Name = "Pwned" }, caller.Id, Guid.NewGuid());

        var reloadedVictim = await context.Workspaces.SingleAsync(w => w.Id == victim.Id);
        var reloadedCaller = await context.Workspaces.SingleAsync(w => w.Id == caller.Id);
        Assert.Equal("TheirCompany", reloadedVictim.Name);
        Assert.Equal("Pwned", reloadedCaller.Name);
    }

    [Fact]
    public async Task DeleteWorkspace_throws_when_the_target_is_not_the_callers_own()
    {
        await using var context = CreateContext();
        var victim = new Workspace { Id = Guid.NewGuid(), Name = "TheirCompany" };
        context.Workspaces.Add(victim);
        await context.SaveChangesAsync();

        var service = new WorkspaceService(context, new NoopStorageService());

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.DeleteWorkspace(victim.Id, Guid.NewGuid()));

        Assert.True(await context.Workspaces.AnyAsync(w => w.Id == victim.Id));
    }
}
