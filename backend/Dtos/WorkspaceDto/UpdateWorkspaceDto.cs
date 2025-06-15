using backend.Models;

namespace backend.Dtos.WorkspaceDto;

public class UpdateWorkspaceDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public CompanySize? Size { get; set; }
    public string? LogoUrl { get; set; }
    public string? Theme { get; set; }
    public string? Category { get; set; }
}