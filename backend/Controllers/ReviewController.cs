using System.Security.Cryptography;
using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using backend.Services.EmailService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public record ReviewSubmission(int Rating, string? Comment);

[ApiController]
[Route("api/review")]
public class ReviewController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;

    public ReviewController(DataContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [Authorize]
    [HttpPost("job/{jobId:guid}")]
    public async Task<IActionResult> Create(Guid jobId)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var job = await _db.Jobs.Include(j => j.Customer).FirstOrDefaultAsync(j => j.Id == jobId && j.WorkspaceId == workspaceId);
        if (job == null) return NotFound();
        var existing = await _db.ReviewRequests.FirstOrDefaultAsync(r => r.JobId == jobId);
        if (existing != null) return Ok(new { id = existing.Id, alreadyCreated = true });
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var request = new ReviewRequest { Id = Guid.NewGuid(), WorkspaceId = workspaceId, JobId = jobId, CustomerId = job.CustomerId, TokenHash = Hash(token), Channel = "Email" };
        _db.ReviewRequests.Add(request);
        await _db.SaveChangesAsync();
        return Ok(new { id = request.Id, token });
    }

    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<IActionResult> Get(string token)
    {
        var request = await _db.ReviewRequests.FirstOrDefaultAsync(r => r.TokenHash == Hash(token));
        if (request == null) return NotFound();
        request.OpenedAt ??= DateTime.UtcNow;
        await _db.SaveChangesAsync();
        var workspace = await _db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == request.WorkspaceId);
        return Ok(new { workspace = workspace?.CompanyName ?? workspace?.Name ?? "Business", rating = request.Rating, comment = request.Comment, googleReviewUrl = workspace?.GoogleReviewUrl });
    }

    [AllowAnonymous]
    [HttpPost("{token}")]
    public async Task<IActionResult> Submit(string token, [FromBody] ReviewSubmission submission)
    {
        if (submission.Rating is < 1 or > 5) return BadRequest(new { message = "Rating must be between 1 and 5." });
        var request = await _db.ReviewRequests.FirstOrDefaultAsync(r => r.TokenHash == Hash(token));
        if (request == null) return NotFound();
        request.Rating = submission.Rating;
        request.Comment = submission.Comment?.Trim();
        request.RespondedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Thank you for your feedback." });
    }

    private static string Hash(string value) => Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value)));
}
