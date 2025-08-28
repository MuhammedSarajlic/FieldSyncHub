using backend.Models;

namespace backend.Dtos.CalendarDto;

public class CalendarEventsDto
{
    public List<Event> Events { get; set; } = [];
    public List<Job> Jobs { get; set; } = [];
    public List<Lead> Leads { get; set; } = [];
}