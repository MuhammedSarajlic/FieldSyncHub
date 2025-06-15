using backend.Data;
using backend.Dtos.WorkspaceDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.WorkspaceService;

public class WorkspaceService : IWorkspaceService
{
    private readonly DataContext _context;
    public WorkspaceService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<GetWorkspaceDto>>> GetWorkspaces()
    {
        var workspaces = await _context.Workspaces.Include(w => w.Users).ToListAsync();
        var workspacesDto = workspaces.Adapt<List<GetWorkspaceDto>>();
        return new ApiResponse<List<GetWorkspaceDto>>()
        {
            Success = true,
            Payload = workspacesDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id)
    {
        var workspace = await _context.Workspaces.Include(w => w.Users).FirstOrDefaultAsync(w => w.Id == id);
        if (workspace == null)
        {
            return new ApiResponse<GetWorkspaceDto>()
            {
                Success = false,
                Payload = null,
                ErrorMessage = $"Workspace with ID {id} not found."
            };
        }
        var workspaceDto = workspace.Adapt<GetWorkspaceDto>();
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

        return new ApiResponse<GetWorkspaceDto>()
        {
            Success = true,
            Payload = createdWorkspaceDto,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<GetWorkspaceDto>> UpdateWorkspace(UpdateWorkspaceDto updatedWorkspaceDto)
    {
        var existingWorkspace = await _context.Workspaces
                                        .Include(w => w.CreatedByUser)
                                        .Include(w => w.Users)
                                        .FirstOrDefaultAsync(w => w.Id == updatedWorkspaceDto.Id);

        if (existingWorkspace == null)
        {
            return new ApiResponse<GetWorkspaceDto>()
            {
                Success = false,
                Payload = null,
                ErrorMessage = $"Workspace with ID {updatedWorkspaceDto.Id} not found."
            };
        }

        if (updatedWorkspaceDto.Name != null) existingWorkspace.Name = updatedWorkspaceDto.Name;
        if (updatedWorkspaceDto.CompanyName != null) existingWorkspace.CompanyName = updatedWorkspaceDto.CompanyName;
        if (updatedWorkspaceDto.CompanyUrl != null) existingWorkspace.CompanyUrl = updatedWorkspaceDto.CompanyUrl;
        if (updatedWorkspaceDto.PhoneNumber != null) existingWorkspace.PhoneNumber = updatedWorkspaceDto.PhoneNumber;
        if (updatedWorkspaceDto.Size.HasValue) existingWorkspace.Size = updatedWorkspaceDto.Size.Value;
        if (updatedWorkspaceDto.LogoUrl != null) existingWorkspace.LogoUrl = updatedWorkspaceDto.LogoUrl;
        if (updatedWorkspaceDto.Theme != null) existingWorkspace.Theme = updatedWorkspaceDto.Theme;
        if (updatedWorkspaceDto.Category != null) existingWorkspace.Category = updatedWorkspaceDto.Category;

        existingWorkspace.UpdatedAt = DateTime.UtcNow;

        _context.Update(existingWorkspace);
        await _context.SaveChangesAsync();

        var updatedWorkspaceResultDto = existingWorkspace.Adapt<GetWorkspaceDto>();

        return new ApiResponse<GetWorkspaceDto>()
        {
            Success = true,
            Payload = updatedWorkspaceResultDto,
            ErrorMessage = null
        };
    }

    public async Task DeleteWorkspace(Guid id)
    {
        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == id);
        _context.Remove(workspace);
        await _context.SaveChangesAsync();
    }
}