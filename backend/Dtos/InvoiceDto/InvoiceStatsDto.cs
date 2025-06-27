using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.InvoiceDto
{
    public class InvoiceStatsDto
    {
        public decimal TotalOutstanding { get; set; }
        public decimal TotalPaidThisMonth { get; set; }
        public int OverdueCount { get; set; }
        public decimal AverageInvoiceValue { get; set; }
    }
}