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
    public ICollection<User> Users { get; set; } = new List<User>();
    
    [NotMapped]
    public User? User { get; set; }
}