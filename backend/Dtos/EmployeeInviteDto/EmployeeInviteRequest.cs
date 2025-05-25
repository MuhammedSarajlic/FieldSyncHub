using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.EmployeeInviteDto
{
    public class EmployeeInviteRequest
    {
        public List<string> Emails { get; set; } = [];
        public Guid WorkspaceId { get; set; }
    }
}