using backend.Dtos.CalendarDto;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CalendarService;

public class CalendarService : ICalendarService
{
    private readonly DataContext _context;

    public CalendarService(DataContext context)
    {
        _context = context;
    }

    public async Task<CalendarEventsDto> GetAllCalendarEvents()
    {
        var dto = new CalendarEventsDto
        {
            Events = await _context.Events
                .Include(e => e.AssignedTo)
                .Include(e => e.RecurrenceRule)
                .ToListAsync(),

            Jobs = await _context.Jobs
                .ToListAsync(),

            Leads = await _context.Leads
                .ToListAsync()
        };

        return dto;
    }

    public async Task<CalendarEventsDto> GetAllCalendarEventsByWorkspace(Guid workspaceId)
    {
        var dto = new CalendarEventsDto
        {
            Events = await _context.Events
                .Where(e => e.WorkspaceId == workspaceId)
                .Include(e => e.AssignedTo)
                .Include(e => e.RecurrenceRule)
                .ToListAsync(),

            Jobs = await _context.Jobs
                .Where(j => j.WorkspaceId == workspaceId)
                .ToListAsync(),

            Leads = await _context.Leads
                .Where(r => r.WorkspaceId == workspaceId)
                .ToListAsync()
        };

        return dto;
    }

    public async Task<CalendarEventsDto> GetCalendarEventsByWorkspaceAndDateRange(Guid workspaceId, DateTime startDate, DateTime endDate)
    {
        var dto = new CalendarEventsDto
        {
            Events = await _context.Events
                .Where(e => e.WorkspaceId == workspaceId &&
                            e.StartDateTime >= startDate &&
                            e.EndDateTime <= endDate)
                .Include(e => e.AssignedTo)
                .Include(e => e.RecurrenceRule)
                .ToListAsync(),

            Jobs = await _context.Jobs
                .Where(j => j.WorkspaceId == workspaceId &&
                            j.StartDateTime >= startDate &&
                            j.EndDateTime <= endDate)
                .ToListAsync(),

            Leads = await _context.Leads
                .Where(r => r.WorkspaceId == workspaceId &&
                            r.StartDateTime >= startDate &&
                            r.EndDateTime <= endDate)
                .ToListAsync()
        };

        return dto;
    }
}
