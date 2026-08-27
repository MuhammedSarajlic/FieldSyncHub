using backend.Dtos.EventDto;
using backend.Models;

namespace backend.Services.EventService;

public interface IEventService
{
    Task<Event?> GetEventByIdAsync(Guid id);
    Task<List<Event>> GetEventsByWorkspaceIdAsync(Guid workspaceId);
    Task<Event> CreateEventAsync(CreateEventDto dto);
    Task<Event?> UpdateEventAsync(UpdateEventDto dto);
    Task<bool> DeleteEventAsync(Guid id);
}