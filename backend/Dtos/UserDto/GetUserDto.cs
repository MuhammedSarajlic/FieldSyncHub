using backend.Dtos.WorkspaceDto;
using backend.Models;

namespace backend.Dtos.UserDto;

public class GetUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole? Role { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public WorkspaceLookupDto? Workspace { get; set; }
    public List<UserWorkspaceDto> Workspaces { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UserWorkspaceDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}
