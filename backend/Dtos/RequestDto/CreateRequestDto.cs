using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Dtos.RequestDto
{
    public class CreateRequestDto
    {
        public Guid CustomerId { get; set; }
        public Guid WorkspaceId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? PreferredDate { get; set; }
        public string? PreferredTime { get; set; }
        public List<LineItem>? LineItems { get; set; }
        public string? Notes { get; set; }
    }
}