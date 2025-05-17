using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Employee
    {
        [Key] 
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User User { get; set; }

        public Guid WorkspaceId { get; set; }
        public Workspace Workspace { get; set; }

        public string? Position { get; set; }
        public string? Department { get; set; }
        public string Status { get; set; } = "active"; // active, on-leave, terminated
        public DateTime HireDate { get; set; }
    }
}