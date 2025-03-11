using backend.Data;
using backend.Models;
using backend.Response;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.WorkspaceService;

public class WorkspaceService : IWorkspaceService
{
    private readonly DataContext _context;
    public WorkspaceService(DataContext context)
    {
        _context = context;
    }
    public async Task AddWorkspace(Workspace newWorkspace)
    {
        newWorkspace.Id = Guid.NewGuid();
        await _context.Workspaces.AddAsync(newWorkspace);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteWorkspace(Guid id)
    {
        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == id);
        _context.Remove(workspace);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<Workspace>> GetWorkspaceById(Guid id)
    {
        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == id);
        return new ApiResponse<Workspace>()
        {
            Success = true,
            Payload = workspace,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Workspace>>> GetWorkspaces()
    {
        var workspaces = await _context.Workspaces.ToListAsync();
        return new ApiResponse<List<Workspace>>()
        {
            Success = true,
            Payload = workspaces,
            ErrorMessage = null
        };
    }

    public async Task UpdateWorkspace(Workspace updatedWorkspace)
    {
        _context.Update(updatedWorkspace);
        await _context.SaveChangesAsync();
    }
}