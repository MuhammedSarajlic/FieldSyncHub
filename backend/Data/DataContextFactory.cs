using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Data
{
    public class DataContextFactory : IDesignTimeDbContextFactory<DataContext>
    {
        public DataContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__WebApiDatabase")
                ?? "server=localhost;database=fieldsync;user=root;password=root;";
            optionsBuilder.UseMySql(
                connectionString,
                new MySqlServerVersion(new Version(8, 0, 36))
            );

            return new DataContext(optionsBuilder.Options);
        }
    }
}
