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
                .Include(j => j.RecurrenceRule)
                .AsNoTracking()
                .ToListAsync(),

            Leads = await _context.Leads
                .Where(r => r.WorkspaceId == workspaceId &&
                            r.StartDateTime <= endDate &&
                            r.EndDateTime >= startDate)
                .ToListAsync()
        };

        dto.Jobs = dto.Jobs.SelectMany(job => Expand(job, startDate, endDate)).ToList();
        return dto;
    }

    private static IEnumerable<backend.Models.Job> Expand(backend.Models.Job source, DateTime start, DateTime end)
    {
        var rule = source.RecurrenceRule;
        if (rule == null || rule.Frequency == backend.Models.RecurrenceFrequency.None) { yield return source; yield break; }
        var cursor = source.StartDateTime;
        var duration = source.EndDateTime - source.StartDateTime;
        var occurrence = 0;
        while (cursor <= end && occurrence < 1000)
        {
            var dayMatches = rule.DaysOfWeek.Count == 0 || rule.DaysOfWeek.Contains(cursor.DayOfWeek);
            if (cursor >= start && dayMatches)
            {
                yield return CopyAt(source, cursor, duration);
                occurrence++;
            }
            cursor = rule.Frequency switch
            {
                backend.Models.RecurrenceFrequency.Daily => cursor.AddDays(rule.Interval),
                backend.Models.RecurrenceFrequency.Weekly => cursor.AddDays(1),
                backend.Models.RecurrenceFrequency.Monthly => cursor.AddMonths(rule.Interval),
                backend.Models.RecurrenceFrequency.Yearly => cursor.AddYears(rule.Interval),
                _ => cursor.AddDays(rule.Interval)
            };
            if (rule.EndType == backend.Models.RecurrenceEndType.OnDate && rule.EndDate < cursor) break;
            if (rule.EndType == backend.Models.RecurrenceEndType.AfterOccurrences && rule.OccurrenceCount <= occurrence) break;
        }
    }

    private static backend.Models.Job CopyAt(backend.Models.Job source, DateTime start, TimeSpan duration) => new()
    {
        Id = Guid.NewGuid(), WorkspaceId = source.WorkspaceId, Title = source.Title, Description = source.Description,
        CustomerId = source.CustomerId, PropertyId = source.PropertyId, JobType = source.JobType, Status = source.Status,
        Priority = source.Priority, StartDateTime = start, EndDateTime = start + duration, RecurrenceRuleId = source.RecurrenceRuleId,
        RecurrenceRule = source.RecurrenceRule, ArrivalWindow = source.ArrivalWindow, EstimatedDurationMinutes = source.EstimatedDurationMinutes,
        AssignedTeamMembers = source.AssignedTeamMembers, LineItems = source.LineItems, JobNumber = source.JobNumber
    };
}
