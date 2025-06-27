using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.QuoteDto
{
    public class QuoteStatsDto
    {
        public int TotalQuotes { get; set; }
        public decimal TotalValue { get; set; }
        public decimal ApprovedValue { get; set; }
        public double ConversionRate { get; set; }
    }
}