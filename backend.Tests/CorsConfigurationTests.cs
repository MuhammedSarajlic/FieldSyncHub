using backend.Extensions;

namespace backend.Tests;

/// <summary>
/// CORS origins were hardcoded to http://localhost:5173, so no deployed frontend
/// could ever call the API. Allowed origins now come from AppSettings:FrontendUrl.
/// </summary>
public class CorsConfigurationTests
{
    [Fact]
    public void ParseAllowedOrigins_returns_the_configured_origin()
    {
        var origins = CorsConfiguration.ParseAllowedOrigins("https://app.fieldsynchub.com");

        Assert.Equal(["https://app.fieldsynchub.com"], origins);
    }

    [Fact]
    public void ParseAllowedOrigins_splits_a_comma_separated_list()
    {
        var origins = CorsConfiguration.ParseAllowedOrigins("https://app.example.com, https://www.example.com");

        Assert.Equal(["https://app.example.com", "https://www.example.com"], origins);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ParseAllowedOrigins_falls_back_to_localhost_when_unset(string? configured)
    {
        var origins = CorsConfiguration.ParseAllowedOrigins(configured);

        Assert.Equal(["http://localhost:5173"], origins);
    }
}
