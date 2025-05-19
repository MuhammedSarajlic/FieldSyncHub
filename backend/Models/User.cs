using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Workspace? Workspace { get; set; }
    public UserRole? Role { get; set; }
}

public enum UserRole
{
    Owner,
    Admin,
    Employee
}