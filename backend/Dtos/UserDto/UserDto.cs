using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dtos.UserDto;

public class UserDto
{
    [Key]
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Workspace? Workspace { get; set; }
    public UserRole? Role { get; set; }
}