using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }
        public DbSet<User> Users => Set<User>(); 
        public DbSet<Customers> Customers => Set<Customers>();
        public DbSet<CustomFields> CustomFields => Set<CustomFields>();
        public DbSet<CustomFiledValue> CustomFiledValues => Set<CustomFiledValue>();
    }
}