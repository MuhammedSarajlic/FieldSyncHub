using backend.Dtos.CalendarDto;

namespace backend.Services.CalendarService;

public interface ICalendarService
{
    Task<CalendarEventsDto> GetAllCalendarEvents();
    Task<CalendarEventsDto> GetAllCalendarEventsByWorkspace(Guid workspaceId);
    Task<CalendarEventsDto> GetCalendarEventsByWorkspaceAndDateRange(Guid workspaceId, DateTime startDate, DateTime endDate);
}
