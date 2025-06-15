using backend.Models;

namespace backend.Dtos.WorkspaceDto;

public class CreateWorkspaceDto
{
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? CompanyUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public CompanySize Size { get; set; } = CompanySize.Solo;
    public Guid CreatedByUserId { get; set; }
    public string? LogoUrl { get; set; }
    public string Theme { get; set; } = "light";
    public string Category { get; set; } = string.Empty;
}