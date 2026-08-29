using backend.Models;
using backend.Services.CurrentUserService;

namespace backend.Tests.TestDoubles;

public sealed class FakeCurrentUser : ICurrentUser
{
    public Guid? UserId { get; init; }
    public Guid? WorkspaceId { get; init; }
    public UserRole? Role { get; init; }
}
