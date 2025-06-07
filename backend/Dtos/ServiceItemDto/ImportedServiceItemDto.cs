using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.ServiceItemDto
{
    public class ImportedServiceItemDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Category { get; set; }
        public string SKU { get; set; }
        public int Hours { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Cost { get; set; }
        public decimal TaxRate { get; set; }
        public bool IsTaxable { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
    }
}