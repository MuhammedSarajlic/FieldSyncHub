using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.JobDto
{
    public class JobStatsDto
    {
        public int TotalJobs { get; set; }
        public int CompletedJobs { get; set; }
        public int ScheduledJobs { get; set; }
        public decimal TotalValue { get; set; }
    }
}