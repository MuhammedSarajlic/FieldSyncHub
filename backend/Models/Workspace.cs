using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Workspace
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Theme { get; set; } = "light";
    public string Category { get; set; } = string.Empty;
    public List<string> Users { get; set; } = [];
    [NotMapped]
    public User? User { get; set; }
}