
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos.EventDto;

namespace backend.Services.EventService;

public class EventService : IEventService
{
    private readonly DataContext _context;

    public EventService(DataContext context)
    {
        _context = context;
    }

    public async Task<List<Event>> GetAllEventsAsync()
    {
        return await _context.Events
            .Include(e => e.AssignedTo)
            .Include(e => e.RecurrenceRule)
            .ToListAsync();
    }

    public async Task<Event?> GetEventByIdAsync(Guid id)
    {
        return await _context.Events
            .Include(e => e.AssignedTo)
            .Include(e => e.RecurrenceRule)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<List<Event>> GetEventsByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.Events
            .Where(e => e.WorkspaceId == workspaceId)
            .Include(e => e.AssignedTo)
            .Include(e => e.RecurrenceRule)
            .ToListAsync();
    }

    public async Task<Event> CreateEventAsync(CreateEventDto dto)
    {
        var entity = new Event
        {
            Id = Guid.NewGuid(),
            WorkspaceId = dto.WorkspaceId,
            Title = dto.Title,
            Description = dto.Description,
            AssignedToIds = dto.AssignedToIds,
            StartDateTime = dto.StartDateTime,
            EndDateTime = dto.EndDateTime,
            IsAllDay = dto.IsAllDay,
            IsRecurring = dto.IsRecurring,
            RecurrenceRuleId = dto.RecurrenceRuleId,
            CreatedBy = dto.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.RecurrenceRule != null)
        {
            entity.RecurrenceRule = new RecurrenceRule
            {
                Id = Guid.NewGuid(),
                Frequency = dto.RecurrenceRule.Frequency,
                Interval = dto.RecurrenceRule.Interval,
                DaysOfWeek = dto.RecurrenceRule.DaysOfWeek,
                DayOfMonth = dto.RecurrenceRule.DayOfMonth,
                WeekOfMonth = dto.RecurrenceRule.WeekOfMonth,
                DayOfWeekInMonth = dto.RecurrenceRule.DayOfWeekInMonth,
                MonthOfYear = dto.RecurrenceRule.MonthOfYear,
                EndType = dto.RecurrenceRule.EndType,
                OccurrenceCount = dto.RecurrenceRule.OccurrenceCount,
                EndDate = dto.RecurrenceRule.EndDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        _context.Events.Add(entity);
        await _context.SaveChangesAsync();

        return entity;
    }

    public async Task<Event?> UpdateEventAsync(UpdateEventDto dto)
    {
        var entity = await _context.Events
            .Include(e => e.RecurrenceRule)
            .FirstOrDefaultAsync(e => e.Id == dto.Id);

        if (entity == null)
            return null;

        entity.WorkspaceId = dto.WorkspaceId;
        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.AssignedToIds = dto.AssignedToIds;
        entity.StartDateTime = dto.StartDateTime;
        entity.EndDateTime = dto.EndDateTime;
        entity.IsAllDay = dto.IsAllDay;
        entity.IsRecurring = dto.IsRecurring;
        entity.RecurrenceRuleId = dto.RecurrenceRuleId;
        entity.UpdatedAt = DateTime.UtcNow;

        if (dto.RecurrenceRule != null)
        {
            if (entity.RecurrenceRule == null)
            {
                entity.RecurrenceRule = new RecurrenceRule
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow
                };
            }

            entity.RecurrenceRule.Frequency = dto.RecurrenceRule.Frequency;
            entity.RecurrenceRule.Interval = dto.RecurrenceRule.Interval;
            entity.RecurrenceRule.DaysOfWeek = dto.RecurrenceRule.DaysOfWeek;
            entity.RecurrenceRule.DayOfMonth = dto.RecurrenceRule.DayOfMonth;
            entity.RecurrenceRule.WeekOfMonth = dto.RecurrenceRule.WeekOfMonth;
            entity.RecurrenceRule.DayOfWeekInMonth = dto.RecurrenceRule.DayOfWeekInMonth;
            entity.RecurrenceRule.MonthOfYear = dto.RecurrenceRule.MonthOfYear;
            entity.RecurrenceRule.EndType = dto.RecurrenceRule.EndType;
            entity.RecurrenceRule.OccurrenceCount = dto.RecurrenceRule.OccurrenceCount;
            entity.RecurrenceRule.EndDate = dto.RecurrenceRule.EndDate;
            entity.RecurrenceRule.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteEventAsync(Guid id)
    {
        var entity = await _context.Events.FindAsync(id);
        if (entity == null)
            return false;

        _context.Events.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
