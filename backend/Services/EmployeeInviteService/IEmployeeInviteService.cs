using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.UserDto;
using backend.Models;

namespace backend.Services.EmployeeInviteService
{
    public interface IEmployeeInviteService
    {
        Task SendInvite(string email, Guid workspaceId);
        Task<EmployeeInvite> CreateInviteAsync(string email, Guid workspaceId, string role);
        Task<EmployeeInvite?> ValidateInviteTokenAsync(string token);
        Task<bool> AcceptInviteAsync(string token, UserLoginDto user);
    }
}