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
        public DbSet<Workspace> Workspaces => Set<Workspace>();
        public DbSet<Notes> Notes => Set<Notes>();
        public DbSet<CustomerPhone> CustomerPhones => Set<CustomerPhone>();
        public DbSet<Property> Properties => Set<Property>();
        public DbSet<ServiceItem> ServiceItems => Set<ServiceItem>();
    }
}