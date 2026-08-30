using Testcontainers.MySql;

namespace backend.Tests;

public class MySqlContainerTests
{
    [Fact]
    public async Task MySql_testcontainer_provides_a_real_database_connection_string()
    {
        // Local unit runs stay fast and do not require Docker. CI sets this flag
        // because its container runner is the integration-test environment.
        if (!string.Equals(Environment.GetEnvironmentVariable("RUN_MYSQL_TESTS"), "true", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        await using var container = new MySqlBuilder()
            .WithImage("mysql:8.0.36")
            .WithDatabase("fieldsync_test")
            .WithUsername("fieldsync")
            .WithPassword("fieldsync-test-password")
            .Build();

        await container.StartAsync();

        Assert.StartsWith("Server=", container.GetConnectionString(), StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Database=fieldsync_test", container.GetConnectionString(), StringComparison.OrdinalIgnoreCase);
    }
}
