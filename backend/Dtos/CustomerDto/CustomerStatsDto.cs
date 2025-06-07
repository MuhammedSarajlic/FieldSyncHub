using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.CustomerDto
{
    public class CustomerStatsDto
    {
        public int Total               { get; set; }
        public int Companies           { get; set; }
        public int Individuals         { get; set; }
        public int NewCustomers        { get; set; }
        public int MissingInfoCustomers{ get; set; }
    }
}