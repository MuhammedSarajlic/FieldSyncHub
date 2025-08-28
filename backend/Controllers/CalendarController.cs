using backend.Dtos.CalendarDto;
using backend.Services.CalendarService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/calendar")]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    [HttpGet]
    public async Task<CalendarEventsDto> GetAllCalendarEvents()
    {
        return await _calendarService.GetAllCalendarEvents();
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<CalendarEventsDto> GetAllCalendarEventsByWorkspace(Guid workspaceId)
    {
        return await _calendarService.GetAllCalendarEventsByWorkspace(workspaceId);
    }

    [HttpGet("workspace/{workspaceId:guid}/range")]
    public async Task<CalendarEventsDto> GetCalendarEventsByWorkspaceAndDateRange(
        Guid workspaceId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        return await _calendarService.GetCalendarEventsByWorkspaceAndDateRange(workspaceId, startDate, endDate);
    }
}
