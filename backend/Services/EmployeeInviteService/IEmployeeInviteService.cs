using backend.Dtos.UserDto;
using backend.Models;

namespace backend.Services.EmployeeInviteService;

public interface IEmployeeInviteService
{
    Task SendInvite(string email, Guid workspaceId, UserRole role = UserRole.Employee);
    Task<EmployeeInvite?> ValidateInviteTokenAsync(string token);
    Task<string?> AcceptInviteAsync(string token, UserRegisterDto user);
    Task<List<EmployeeInvite>> GetPendingInvites(Guid workspaceId);
    Task<bool> RevokeInvite(Guid id, Guid workspaceId);
    Task SendInviteAgain(Guid id, Guid workspaceId);
}
