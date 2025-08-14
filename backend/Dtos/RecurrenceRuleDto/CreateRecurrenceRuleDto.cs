using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dtos.RecurrenceRuleDto;

public class CreateRecurrenceRuleDto
{
    [Required]
    public RecurrenceFrequency Frequency { get; set; }

    public int Interval { get; set; } = 1;

    public List<DayOfWeek> DaysOfWeek { get; set; } = [];

    public int? DayOfMonth { get; set; }
    public int? WeekOfMonth { get; set; }
    public DayOfWeek? DayOfWeekInMonth { get; set; }
    public int? MonthOfYear { get; set; }

    [Required]
    public RecurrenceEndType EndType { get; set; }
    public int? OccurrenceCount { get; set; }
    public DateTime? EndDate { get; set; }
}