using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.CustomerDto
{
    public class ImportedCustomerDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public bool IsCompany { get; set; }
        public List<string>? Email { get; set; }
        public bool VisitReminders { get; set; } = true;
        public bool JobFollowUps { get; set; } = true;
        public bool QuoteFollowUps { get; set; } = true;
        public bool InvoiceFollowUps { get; set; } = true;
        public bool Archived { get; set; } = false;
        public List<string>? Tags { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}