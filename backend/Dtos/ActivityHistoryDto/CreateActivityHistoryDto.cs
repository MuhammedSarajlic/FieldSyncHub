using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.ActivityHistoryDto
{
    public class CreateActivityHistoryDto
    {
        public string Action { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public Guid ChangedBy { get; set; }
        public Guid ChangedByName { get; set; }
    }
}