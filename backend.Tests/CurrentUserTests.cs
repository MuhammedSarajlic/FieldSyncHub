using System.Security.Claims;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Http;

namespace backend.Tests;

public class CurrentUserTests
{
    private static ICurrentUser Build(params Claim[] claims)
    {
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"))
        };
        var accessor = new HttpContextAccessor { HttpContext = httpContext };
        return new CurrentUser(accessor);
    }

    [Fact]
    public void Reads_user_id_workspace_id_and_role_from_claims()
    {
        var userId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();

        var currentUser = Build(
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("workspaceId", workspaceId.ToString()),
            new Claim(ClaimTypes.Role, "Admin"));

        Assert.Equal(userId, currentUser.UserId);
        Assert.Equal(workspaceId, currentUser.WorkspaceId);
        Assert.Equal(UserRole.Admin, currentUser.Role);
    }

    [Fact]
    public void Returns_null_workspace_id_when_the_claim_is_an_empty_string()
    {
        var currentUser = Build(
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim("workspaceId", ""),
            new Claim(ClaimTypes.Role, "Owner"));

        Assert.Null(currentUser.WorkspaceId);
    }

    [Fact]
    public void Returns_nulls_when_there_is_no_authenticated_user()
    {
        var accessor = new HttpContextAccessor { HttpContext = null };
        var currentUser = new CurrentUser(accessor);

        Assert.Null(currentUser.UserId);
        Assert.Null(currentUser.WorkspaceId);
        Assert.Null(currentUser.Role);
    }
}
