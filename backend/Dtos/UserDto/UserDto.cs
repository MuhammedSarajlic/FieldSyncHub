using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dtos.UserDto;

public class UserDto
{
    [Key]
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Workspace? Workspace { get; set; }
    public UserRole? Role { get; set; }
}