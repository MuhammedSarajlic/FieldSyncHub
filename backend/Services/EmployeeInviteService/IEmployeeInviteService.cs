using backend.Dtos.UserDto;
using backend.Models;

namespace backend.Services.EmployeeInviteService;

public interface IEmployeeInviteService
{
    Task SendInvite(string email, Guid workspaceId, UserRole role = UserRole.Employee);
    Task<EmployeeInvite?> ValidateInviteTokenAsync(string token);
    Task<string?> AcceptInviteAsync(string token, UserRegisterDto user);
}