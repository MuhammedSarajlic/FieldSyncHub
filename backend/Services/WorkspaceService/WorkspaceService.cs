using backend.Data;
using backend.Dtos.WorkspaceDto;
using backend.Models;
using backend.Response;
using backend.Services.StorageService;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.WorkspaceService;

public class WorkspaceService : IWorkspaceService
{
    private static readonly TimeSpan ReferenceCacheDuration = TimeSpan.FromMinutes(2);
    private readonly DataContext _context;
    private readonly IStorageService _storageService;
    private readonly IMemoryCache? _cache;

    public WorkspaceService(DataContext context, IStorageService storageService, IMemoryCache? cache = null)
    {
        _context = context;
        _storageService = storageService;
        _cache = cache;
    }

    public async Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id, Guid callerWorkspaceId)
    {
        var cacheKey = $"workspace-settings:{id}";
        if (_cache?.TryGetValue(cacheKey, out ApiResponse<GetWorkspaceDto>? cached) == true && cached != null)
        {
            return cached;
        }

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
        var response = new ApiResponse<GetWorkspaceDto>()
        {
            Success = true,
            Payload = workspaceDto,
            ErrorMessage = null
        };
        _cache?.Set(cacheKey, response, ReferenceCacheDuration);
        return response;
    }

    public async Task<ApiResponse<GetWorkspaceDto>> CreateWorkspace(CreateWorkspaceDto createWorkspaceDto, Guid createdById)
    {
        var newWorkspace = createWorkspaceDto.Adapt<Workspace>();
        newWorkspace.Currency = NormalizeCurrencyCode(newWorkspace.Currency);
        newWorkspace.DefaultPaymentTerms = NormalizePaymentTerms(newWorkspace.DefaultPaymentTerms);
        newWorkspace.TaxRegistrationNumber = NormalizeOptional(newWorkspace.TaxRegistrationNumber);
        newWorkspace.AddressLine1 = NormalizeOptional(newWorkspace.AddressLine1);
        newWorkspace.AddressLine2 = NormalizeOptional(newWorkspace.AddressLine2);
        newWorkspace.City = NormalizeOptional(newWorkspace.City);
        newWorkspace.State = NormalizeOptional(newWorkspace.State);
        newWorkspace.PostalCode = NormalizeOptional(newWorkspace.PostalCode);
        newWorkspace.Country = NormalizeOptional(newWorkspace.Country);
        newWorkspace.TimeZoneId = NormalizeTimeZone(newWorkspace.TimeZoneId);

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
        await _context.Subscriptions.AddAsync(new Subscription { Id = Guid.NewGuid(), WorkspaceId = newWorkspace.Id });

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
        await _context.WorkspaceMemberships.AddAsync(new WorkspaceMembership { Id = Guid.NewGuid(), UserId = user.Id, WorkspaceId = newWorkspace.Id, Role = UserRole.Owner });
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
        if (updatedWorkspaceDto.Currency != null) existingWorkspace.Currency = NormalizeCurrencyCode(updatedWorkspaceDto.Currency);
        if (updatedWorkspaceDto.DefaultTaxRate.HasValue) existingWorkspace.DefaultTaxRate = updatedWorkspaceDto.DefaultTaxRate.Value;
        if (updatedWorkspaceDto.DefaultPaymentTerms != null) existingWorkspace.DefaultPaymentTerms = NormalizePaymentTerms(updatedWorkspaceDto.DefaultPaymentTerms);
        if (updatedWorkspaceDto.TaxRegistrationNumber != null) existingWorkspace.TaxRegistrationNumber = NormalizeOptional(updatedWorkspaceDto.TaxRegistrationNumber);
        if (updatedWorkspaceDto.AddressLine1 != null) existingWorkspace.AddressLine1 = NormalizeOptional(updatedWorkspaceDto.AddressLine1);
        if (updatedWorkspaceDto.AddressLine2 != null) existingWorkspace.AddressLine2 = NormalizeOptional(updatedWorkspaceDto.AddressLine2);
        if (updatedWorkspaceDto.City != null) existingWorkspace.City = NormalizeOptional(updatedWorkspaceDto.City);
        if (updatedWorkspaceDto.State != null) existingWorkspace.State = NormalizeOptional(updatedWorkspaceDto.State);
        if (updatedWorkspaceDto.PostalCode != null) existingWorkspace.PostalCode = NormalizeOptional(updatedWorkspaceDto.PostalCode);
        if (updatedWorkspaceDto.Country != null) existingWorkspace.Country = NormalizeOptional(updatedWorkspaceDto.Country);
        if (updatedWorkspaceDto.TimeZoneId != null) existingWorkspace.TimeZoneId = NormalizeTimeZone(updatedWorkspaceDto.TimeZoneId);
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
        if (updatedWorkspaceDto.DunningEnabled.HasValue) existingWorkspace.DunningEnabled = updatedWorkspaceDto.DunningEnabled.Value;
        if (updatedWorkspaceDto.DunningDays != null) existingWorkspace.DunningDays = updatedWorkspaceDto.DunningDays;
        if (updatedWorkspaceDto.DocumentPrimaryColor != null) existingWorkspace.DocumentPrimaryColor = updatedWorkspaceDto.DocumentPrimaryColor;
        if (updatedWorkspaceDto.DocumentFooterText != null) existingWorkspace.DocumentFooterText = updatedWorkspaceDto.DocumentFooterText;
        if (updatedWorkspaceDto.DocumentHeaderLayout != null) existingWorkspace.DocumentHeaderLayout = updatedWorkspaceDto.DocumentHeaderLayout;

        existingWorkspace.UpdatedAt = DateTime.UtcNow;

        _context.Update(existingWorkspace);
        await _context.SaveChangesAsync();
        _cache?.Remove($"workspace-settings:{callerWorkspaceId}");

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

        workspace.IsDeleted = true;
        workspace.DeletedAt = DateTime.UtcNow;
        workspace.PurgeAfter = DateTime.UtcNow.AddDays(30);
        // Disable access immediately while retaining data during the retention window.
        foreach (var user in workspace.Users)
        {
            user.WorkspaceId = null; // Detach user
        }

        var memberships = await _context.WorkspaceMemberships.Where(m => m.WorkspaceId == id).ToListAsync();
        foreach (var membership in memberships) membership.IsActive = false;
        _context.WorkspaceMemberships.UpdateRange(memberships);

        _context.Users.UpdateRange(workspace.Users);
        _context.Workspaces.Update(workspace);

        await _context.SaveChangesAsync();
    }

    private static string NormalizeCurrencyCode(string? currency)
        => string.IsNullOrWhiteSpace(currency) ? "USD" : currency.Trim().ToUpperInvariant();

    private static string NormalizePaymentTerms(string? paymentTerms)
        => string.IsNullOrWhiteSpace(paymentTerms) ? "uponReceipt" : paymentTerms.Trim();

    private static string NormalizeTimeZone(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId)) return "UTC";
        try { TimeZoneInfo.FindSystemTimeZoneById(timeZoneId); return timeZoneId.Trim(); }
        catch { return "UTC"; }
    }

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
