using backend.Data;
using backend.Dtos.WorkspaceDto;
using backend.Models;
using backend.Response;
using backend.Services.StorageService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.WorkspaceService;

public class WorkspaceService : IWorkspaceService
{
    private readonly DataContext _context;
    private readonly IStorageService _storageService;
    public WorkspaceService(DataContext context, IStorageService storageService)
    {
        _context = context;
        _storageService = storageService;
    }

    public async Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id, Guid callerWorkspaceId)
    {
        var workspace = await _context.Workspaces.Include(w => w.Users).FirstOrDefaultAsync(w => w.Id == id);

        // Same "not found" message whether it doesn't exist or belongs to another
        // tenant, so this can't be used to probe for other workspaces' ids.
        if (workspace == null || workspace.Id != callerWorkspaceId)
        {
            return new ApiResponse<GetWorkspaceDto>()
            {
                Success = false,
                Payload = null,
                ErrorMessage = $"Workspace with ID {id} not found."
            };
        }
        var workspaceDto = workspace.Adapt<GetWorkspaceDto>();
        workspaceDto.LogoUrl = await _storageService.ResolveAsync(workspaceDto.LogoUrl);
        return new ApiResponse<GetWorkspaceDto>()
        {
            Success = true,
            Payload = workspaceDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetWorkspaceDto>> CreateWorkspace(CreateWorkspaceDto createWorkspaceDto, Guid createdById)
    {
        var newWorkspace = createWorkspaceDto.Adapt<Workspace>();

        // A workspace doesn't exist yet when the onboarding logo is uploaded, so
        // that upload is keyed by the uploading user instead - only accept a
        // LogoUrl that's actually theirs, never an arbitrary URL or another
        // tenant's uploaded path.
        if (!string.IsNullOrWhiteSpace(newWorkspace.LogoUrl) && !UploadPolicy.IsOwnedBy(newWorkspace.LogoUrl, null, createdById))
        {
            newWorkspace.LogoUrl = null;
        }

        newWorkspace.Id = Guid.NewGuid();
        newWorkspace.CreatedAt = DateTime.UtcNow;
        newWorkspace.UpdatedAt = DateTime.UtcNow;
        newWorkspace.CreatedByUserId = createdById;

        await _context.Workspaces.AddAsync(newWorkspace);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == createdById);
        if (user == null)
        {
            return new ApiResponse<GetWorkspaceDto>
            {
                Success = false,
                ErrorMessage = "User creating the workspace not found."
            };
        }

        user.WorkspaceId = newWorkspace.Id;
        user.Workspace = newWorkspace;
        user.Role = UserRole.Owner;

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            WorkspaceId = newWorkspace.Id,
            HireDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = EmployeeStatus.Active,
            IsAvailable = true,
            Position = "Owner"
        };

        await _context.Employees.AddAsync(employee);
        await _context.SaveChangesAsync();

        var createdWorkspaceDto = newWorkspace.Adapt<GetWorkspaceDto>();
        createdWorkspaceDto.LogoUrl = await _storageService.ResolveAsync(createdWorkspaceDto.LogoUrl);

        return new ApiResponse<GetWorkspaceDto>()
        {
            Success = true,
            Payload = createdWorkspaceDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetWorkspaceDto>> UpdateWorkspace(UpdateWorkspaceDto updatedWorkspaceDto, Guid callerWorkspaceId, Guid callerId)
    {
        // The id in the body is ignored - callers may only edit their own workspace.
        var existingWorkspace = await _context.Workspaces
                                        .Include(w => w.CreatedByUser)
                                        .Include(w => w.Users)
                                        .FirstOrDefaultAsync(w => w.Id == callerWorkspaceId);

        if (existingWorkspace == null)
        {
            return new ApiResponse<GetWorkspaceDto>()
            {
                Success = false,
                Payload = null,
                ErrorMessage = $"Workspace with ID {callerWorkspaceId} not found."
            };
        }

        if (updatedWorkspaceDto.Name != null) existingWorkspace.Name = updatedWorkspaceDto.Name;
        if (updatedWorkspaceDto.CompanyName != null) existingWorkspace.CompanyName = updatedWorkspaceDto.CompanyName;
        if (updatedWorkspaceDto.CompanyUrl != null) existingWorkspace.CompanyUrl = updatedWorkspaceDto.CompanyUrl;
        if (updatedWorkspaceDto.PhoneNumber != null) existingWorkspace.PhoneNumber = updatedWorkspaceDto.PhoneNumber;
        if (updatedWorkspaceDto.Size.HasValue) existingWorkspace.Size = updatedWorkspaceDto.Size.Value;
        // The logo is keyed by the uploading user (see CreateWorkspace) - reject
        // anything that isn't actually this caller's own uploaded path rather than
        // trusting an arbitrary client-supplied URL. An empty string still clears it.
        if (updatedWorkspaceDto.LogoUrl == string.Empty)
        {
            existingWorkspace.LogoUrl = null;
        }
        else if (updatedWorkspaceDto.LogoUrl != null && UploadPolicy.IsOwnedBy(updatedWorkspaceDto.LogoUrl, null, callerId))
        {
            existingWorkspace.LogoUrl = updatedWorkspaceDto.LogoUrl;
        }
        if (updatedWorkspaceDto.Theme != null) existingWorkspace.Theme = updatedWorkspaceDto.Theme;
        if (updatedWorkspaceDto.Category != null) existingWorkspace.Category = updatedWorkspaceDto.Category;

        existingWorkspace.UpdatedAt = DateTime.UtcNow;

        _context.Update(existingWorkspace);
        await _context.SaveChangesAsync();

        var updatedWorkspaceResultDto = existingWorkspace.Adapt<GetWorkspaceDto>();
        updatedWorkspaceResultDto.LogoUrl = await _storageService.ResolveAsync(updatedWorkspaceResultDto.LogoUrl);

        return new ApiResponse<GetWorkspaceDto>()
        {
            Success = true,
            Payload = updatedWorkspaceResultDto,
            ErrorMessage = null
        };
    }

    public async Task DeleteWorkspace(Guid id, Guid callerWorkspaceId)
    {
        if (id != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That workspace is not yours.");
        }

        // Get the workspace with related users
        var workspace = await _context.Workspaces
            .Include(w => w.Users)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workspace == null) return;

        // Detach all users from the workspace
        foreach (var user in workspace.Users)
        {
            user.WorkspaceId = null; // Detach user
        }

        _context.Users.UpdateRange(workspace.Users);
        _context.Workspaces.Remove(workspace);

        await _context.SaveChangesAsync();
    }

}