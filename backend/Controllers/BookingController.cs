using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public record PublicBookingRequest(
    string FirstName,
    string LastName,
    string? Email,
    string? PhoneNumber,
    string Description,
    DateTime? PreferredStartDateTime);

[ApiController]
[Route("api/booking")]
public class BookingController : ControllerBase
{
    private readonly DataContext _db;

    public BookingController(DataContext db) => _db = db;

    [AllowAnonymous]
    [HttpPost("{workspaceId:guid}")]
    public async Task<IActionResult> Create(Guid workspaceId, [FromBody] PublicBookingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) ||
            string.IsNullOrWhiteSpace(request.Description))
            return BadRequest(new { message = "Name and a description are required." });

        var workspace = await _db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == workspaceId);
        if (workspace == null) return NotFound();

        var lead = new Lead
        {
            Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(), Email = request.Email?.Trim(), PhoneNumber = request.PhoneNumber?.Trim(),
            Description = request.Description.Trim(), StartDateTime = request.PreferredStartDateTime,
            Source = "Online booking", Status = LeadStatus.Pending
        };
        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();
        return Ok(new { id = lead.Id, message = "Thanks. Your service request has been received." });
    }
}
