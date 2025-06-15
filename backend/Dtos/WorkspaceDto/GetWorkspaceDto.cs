using backend.Dtos.UserDto;
using backend.Models;

namespace backend.Dtos.WorkspaceDto;

public class GetWorkspaceDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? CompanyUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public CompanySize Size { get; set; }
    public UserLookupDto? CreatedByUser { get; set; }
    public string? LogoUrl { get; set; }
    public string Theme { get; set; } = "light";
    public string Category { get; set; } = string.Empty;
    public ICollection<UserLookupDto> Users { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}