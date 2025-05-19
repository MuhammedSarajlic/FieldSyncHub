using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using backend.Data;

namespace backend.Data
{
    public class DataContextFactory : IDesignTimeDbContextFactory<DataContext>
    {
        public DataContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            optionsBuilder.UseMySql(
                "server=localhost;database=fieldsync;user=root;password=root;",
                new MySqlServerVersion(new Version(8, 0, 36))
            );

            return new DataContext(optionsBuilder.Options);
        }
    }
}
