using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class ActivityHistory
    {
        [Key]
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public Guid ChangedBy { get; set; }
        public Guid ChangedByName { get; set; }
    }
}