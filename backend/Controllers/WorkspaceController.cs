using backend.Dtos.WorkspaceDto;
using backend.Data;
using backend.Dtos.UserDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.TokenService;
using backend.Services.WorkspaceService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Controllers;

[ApiController]
[Route("api/workspace")]
public class WorkspaceController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;
    private readonly ICurrentUser _currentUser;
    private readonly DataContext _db;
    private readonly ITokenService _tokenService;

    public WorkspaceController(IWorkspaceService workspaceService, ICurrentUser currentUser, DataContext db, ITokenService tokenService)
    {
        _workspaceService = workspaceService;
        _currentUser = currentUser;
        _db = db;
        _tokenService = tokenService;
    }

    [HttpGet("memberships")]
    public async Task<IActionResult> GetMemberships()
    {
        if (_currentUser.UserId is not Guid userId) return Forbid();
        var memberships = await _db.WorkspaceMemberships.IgnoreQueryFilters()
            .Include(m => m.Workspace)
            .Where(m => m.UserId == userId && m.IsActive && m.Workspace != null && !m.Workspace.IsDeleted)
            .OrderBy(m => m.Workspace!.Name)
            .Select(m => new { id = m.WorkspaceId, name = m.Workspace!.CompanyName ?? m.Workspace.Name, role = m.Role.ToString() })
            .ToListAsync();
        return Ok(memberships);
    }

    [HttpPost("switch/{workspaceId:guid}")]
    public async Task<IActionResult> SwitchWorkspace(Guid workspaceId)
    {
        if (_currentUser.UserId is not Guid userId) return Forbid();
        var membership = await _db.WorkspaceMemberships.IgnoreQueryFilters()
            .Include(m => m.Workspace)
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.WorkspaceId == workspaceId && m.IsActive && m.Workspace != null && !m.Workspace.IsDeleted);
        if (membership?.User == null || membership.Workspace == null) return NotFound();
        var dto = new GetUserDto
        {
            Id = membership.User.Id,
            Email = membership.User.Email,
            FirstName = membership.User.FirstName,
            LastName = membership.User.LastName,
            FullName = membership.User.FullName,
            Role = membership.Role,
            Workspace = new WorkspaceLookupDto { Id = membership.Workspace.Id, Name = membership.Workspace.CompanyName ?? membership.Workspace.Name }
        };
        var tokens = await _tokenService.GenerateTokensAsync(dto);
        _tokenService.SetRefreshTokenCookie(tokens.refreshToken);
        return Ok(new { accessToken = tokens.accessToken, workspace = dto.Workspace, role = dto.Role });
    }

    [HttpGet("{id:guid}/export")]
    public async Task<IActionResult> ExportWorkspace(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId || callerWorkspaceId != id) return Forbid();
        var workspace = await _db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id);
        if (workspace == null) return NotFound();
        var export = new
        {
            exportedAt = DateTime.UtcNow,
            workspace = new { workspace.Id, workspace.Name, workspace.CompanyName, workspace.Currency, workspace.TimeZoneId },
            customers = await _db.Customers.AsNoTracking().Where(c => c.WorkspaceId == id).Select(c => new { c.Id, c.FirstName, c.LastName, c.CompanyName, c.CreatedAt, emails = c.EmailRecords.Select(e => e.Email), tags = c.TagRecords.Select(t => t.Tag) }).ToListAsync(),
            properties = await _db.Properties.AsNoTracking().Where(p => p.Customer != null && p.Customer.WorkspaceId == id).Select(p => new { p.Id, p.CustomerId, p.Street, p.City, p.State, p.Country, p.PostalCode, p.Latitude, p.Longitude }).ToListAsync(),
            serviceItems = await _db.ServiceItems.AsNoTracking().Where(s => s.WorkspaceId == id).ToListAsync(),
            employees = await _db.Employees.AsNoTracking().Where(e => e.WorkspaceId == id).Select(e => new { e.Id, e.UserId, e.Status, e.HireDate, e.HourlyCostRate, e.BillableRate, e.Skills, e.WorkingDays, e.WorkdayStart, e.WorkdayEnd }).ToListAsync(),
            memberships = await _db.WorkspaceMemberships.IgnoreQueryFilters().AsNoTracking().Where(m => m.WorkspaceId == id && m.IsActive).Select(m => new { m.Id, m.UserId, m.Role, m.JoinedAt }).ToListAsync(),
            jobs = await _db.Jobs.AsNoTracking().Where(j => j.WorkspaceId == id).Select(j => new { j.Id, j.JobNumber, j.Title, j.CustomerId, j.PropertyId, j.Status, j.StartDateTime, j.EndDateTime, j.CreatedAt }).ToListAsync(),
            quotes = await _db.Quotes.AsNoTracking().Where(q => q.WorkspaceId == id).Select(q => new { q.Id, q.QuoteNumber, q.Title, q.CustomerId, q.Status, q.Total, q.CreatedAt }).ToListAsync(),
            invoices = await _db.Invoices.AsNoTracking().Where(i => i.WorkspaceId == id).Select(i => new { i.Id, i.InvoiceNumber, i.Title, i.CustomerId, i.JobId, i.WorkflowStatus, i.Total, i.IssueDate, i.DueDate }).ToListAsync(),
            lineItems = await _db.LineItems.AsNoTracking().Where(l => (l.Job != null && l.Job.WorkspaceId == id) || (l.Quote != null && l.Quote.WorkspaceId == id) || (l.Invoice != null && l.Invoice.WorkspaceId == id) || (l.Lead != null && l.Lead.WorkspaceId == id)).ToListAsync(),
            payments = await _db.Payments.AsNoTracking().Where(p => (p.Invoice != null && p.Invoice.WorkspaceId == id) || (p.Job != null && p.Job.WorkspaceId == id)).Select(p => new { p.Id, p.InvoiceId, p.JobId, p.Amount, p.Method, p.Status, p.PaidAt, p.Note }).ToListAsync(),
            leads = await _db.Leads.AsNoTracking().Where(l => l.WorkspaceId == id).Select(l => new { l.Id, l.CustomerId, l.FirstName, l.LastName, l.Email, l.PhoneNumber, l.Source, l.Status, l.CreatedAt }).ToListAsync(),
            events = await _db.Events.AsNoTracking().Where(e => e.WorkspaceId == id).Select(e => new { e.Id, e.Title, e.Description, e.Category, e.Location, e.CustomerId, e.StartDateTime, e.EndDateTime }).ToListAsync(),
            notes = await _db.Notes.IgnoreQueryFilters().AsNoTracking().Where(n => n.WorkspaceId == id).ToListAsync(),
            activity = await _db.ActivityHistorys.AsNoTracking().Where(a => a.WorkspaceId == id).ToListAsync(),
            accounting = await _db.AccountingExternalRecords.AsNoTracking().Where(r => r.WorkspaceId == id).ToListAsync()
        };
        var bytes = JsonSerializer.SerializeToUtf8Bytes(export, new JsonSerializerOptions { WriteIndented = true });
        return File(bytes, "application/json", $"workspace-{id}-export.json");
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return new ApiResponse<GetWorkspaceDto>
            {
                Success = false,
                Payload = null,
                ErrorMessage = $"Workspace with ID {id} not found."
            };
        }

        return await _workspaceService.GetWorkspaceById(id, callerWorkspaceId);
    }

    [HttpPost]
    public async Task<ActionResult<GetWorkspaceDto>> CreateWorkspace([FromBody] CreateWorkspaceDto createWorkspaceDto)
    {
        if (_currentUser.UserId is not Guid callerId)
        {
            return Forbid();
        }

        var workspace = await _workspaceService.CreateWorkspace(createWorkspaceDto, callerId);
        if (!workspace.Success || workspace.Payload == null)
        {
            return Ok(workspace);
        }

        // Signup tokens are issued before a workspace exists and therefore carry
        // an empty workspace claim. Replace that token immediately after
        // onboarding so the first workspace-scoped request can succeed.
        var user = await _db.Users
            .IgnoreQueryFilters()
            .Include(item => item.Workspace)
            .FirstOrDefaultAsync(item => item.Id == callerId);
        if (user == null || user.Workspace == null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Workspace was created but the owner session could not be updated." });
        }

        var userDto = new GetUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = UserRole.Owner,
            Workspace = new WorkspaceLookupDto { Id = user.Workspace.Id, Name = user.Workspace.CompanyName ?? user.Workspace.Name }
        };
        var tokens = await _tokenService.GenerateTokensAsync(userDto);
        _tokenService.SetRefreshTokenCookie(tokens.refreshToken);
        return Ok(new { workspace, accessToken = tokens.accessToken });
    }

    [HttpPut]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<GetWorkspaceDto>> UpdateWorkspace([FromBody] UpdateWorkspaceDto updateWorkspaceDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId || _currentUser.UserId is not Guid callerId)
        {
            return Forbid();
        }

        var workspace = await _workspaceService.UpdateWorkspace(updateWorkspaceDto, callerWorkspaceId, callerId);
        return Ok(workspace);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> DeleteWorkspace(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _workspaceService.DeleteWorkspace(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }

        return Ok();
    }
}
