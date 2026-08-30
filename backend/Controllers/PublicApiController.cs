using System.Security.Cryptography;
using System.Text;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public/v1")]
public class PublicApiController : ControllerBase
{
    private readonly DataContext _db;
    public PublicApiController(DataContext db) => _db = db;

    [HttpGet("customers")]
    public async Task<IActionResult> Customers()
    {
        var workspaceId = await Authenticate(); if (workspaceId == null) return Unauthorized();
        return Ok(await _db.Customers.Where(c => c.WorkspaceId == workspaceId).Select(c => new { c.Id, c.FirstName, c.LastName, c.CompanyName, c.CreatedAt }).ToListAsync());
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> Invoices()
    {
        var workspaceId = await Authenticate(); if (workspaceId == null) return Unauthorized();
        return Ok(await _db.Invoices.Where(i => i.WorkspaceId == workspaceId).Select(i => new { i.Id, i.InvoiceNumber, i.CustomerId, i.DueDate, i.WorkflowStatus, i.CreatedAt }).ToListAsync());
    }

    private async Task<Guid?> Authenticate()
    {
        var raw = Request.Headers["X-Api-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var key = await _db.ApiKeys.IgnoreQueryFilters().FirstOrDefaultAsync(k => k.KeyHash == Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw))) && k.RevokedAt == null);
        if (key == null || !key.Scopes.Split(',', StringSplitOptions.TrimEntries).Contains("read", StringComparer.OrdinalIgnoreCase)) return null;
        key.LastUsedAt = DateTime.UtcNow; await _db.SaveChangesAsync();
        return key.WorkspaceId;
    }
}
