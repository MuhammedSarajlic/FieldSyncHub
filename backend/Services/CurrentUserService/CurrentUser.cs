using System.Security.Claims;
using backend.Models;

namespace backend.Services.CurrentUserService;

public class CurrentUser : ICurrentUser
{
    // Matches the custom claim type TokenService.CreateToken issues the workspace id under -
    // there's no ClaimTypes constant for it since it isn't a standard claim.
    private const string WorkspaceClaimType = "workspaceId";

    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId =>
        Guid.TryParse(Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    public Guid? WorkspaceId =>
        Guid.TryParse(Principal?.FindFirstValue(WorkspaceClaimType), out var id) ? id : null;

    public UserRole? Role =>
        Enum.TryParse<UserRole>(Principal?.FindFirstValue(ClaimTypes.Role), out var role) ? role : null;
}
