using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    public string LastName { get; set; } = string.Empty;
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";
    public Guid? WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }
    public UserRole? Role { get; set; } = UserRole.Employee;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum UserRole
{
    Owner,
    Admin,
    Employee
}