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
        Task<EmployeeInvite?> ValidateInviteTokenAsync(string token);
        Task<string?> AcceptInviteAsync(string token, UserLoginDto user);
    }
}