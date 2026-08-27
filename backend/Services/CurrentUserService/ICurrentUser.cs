using backend.Models;

namespace backend.Services.CurrentUserService;

/// <summary>
/// Identity of the caller as issued in their token, never as supplied by the request
/// (route/query/body). Controllers must compare any workspaceId/userId taken from the
/// request against these values rather than trusting the request's own claim.
/// </summary>
public interface ICurrentUser
{
    Guid? UserId { get; }
    Guid? WorkspaceId { get; }
    UserRole? Role { get; }
}
