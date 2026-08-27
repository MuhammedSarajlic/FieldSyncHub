using backend.Models;
using backend.Dtos.EventDto;
using backend.Services.EventService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/event")]
public class EventController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetEventById(Guid id)
    {
        var evt = await _eventService.GetEventByIdAsync(id);
        if (evt == null) return NotFound();
        return Ok(evt);
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<List<Event>>> GetEventsByWorkspaceId(Guid workspaceId)
    {
        return Ok(await _eventService.GetEventsByWorkspaceIdAsync(workspaceId));
    }

    [HttpPost]
    public async Task<ActionResult<Event>> CreateEvent([FromBody] CreateEventDto dto)
    {
        var created = await _eventService.CreateEventAsync(dto);
        return CreatedAtAction(nameof(GetEventById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Event>> UpdateEvent(Guid id, [FromBody] UpdateEventDto dto)
    {
        if (id != dto.Id) return BadRequest("Event ID mismatch.");

        var updated = await _eventService.UpdateEventAsync(dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var deleted = await _eventService.DeleteEventAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
