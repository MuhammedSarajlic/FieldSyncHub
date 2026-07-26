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
            // Overlap check (not full containment): an item belongs in the range
            // if it starts before the range ends and ends after the range starts.
            Events = await _context.Events
                .Where(e => e.WorkspaceId == workspaceId &&
                            e.StartDateTime <= endDate &&
                            e.EndDateTime >= startDate)
                .Include(e => e.AssignedTo)
                .Include(e => e.RecurrenceRule)
                .ToListAsync(),

            Jobs = await _context.Jobs
                .Where(j => j.WorkspaceId == workspaceId &&
                            j.StartDateTime <= endDate &&
                            j.EndDateTime >= startDate)
                .Include(j => j.AssignedTeamMembers)
                .ToListAsync(),

            Leads = await _context.Leads
                .Where(r => r.WorkspaceId == workspaceId &&
                            r.StartDateTime <= endDate &&
                            r.EndDateTime >= startDate)
                .ToListAsync()
        };

        return dto;
    }
}
