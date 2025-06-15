using backend.Models;

namespace backend.Dtos.UserDto;

public class UpdateUserDto
{
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public UserRole? Role { get; set; } = UserRole.Employee;
}