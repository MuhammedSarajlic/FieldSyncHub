using backend.Models;

namespace backend.Dtos.EmployeeInviteDto;

public class EmployeeInviteRequest
{
    public List<string> Emails { get; set; } = [];
    public UserRole Role { get; set; } = UserRole.Employee;
}