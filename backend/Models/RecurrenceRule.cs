public class RecurrenceRule
{
    public Guid Id { get; set; }

    // Core type of recurrence
    public RecurrenceFrequency Frequency { get; set; } // Daily, Weekly, Monthly, Yearly, Custom

    // Interval between occurrences (e.g., every 2 days, every 3 weeks, etc.)
    public int Interval { get; set; } = 1;

    // WEEKLY: which days of the week this occurs on (bitmask or list)
    public List<DayOfWeek> DaysOfWeek { get; set; } = new();

    // MONTHLY: specific day of month (e.g., 15) - null if using WeekOfMonth/DayOfWeekInMonth
    public int? DayOfMonth { get; set; }

    // MONTHLY (alternative): week of month (1 = first, 2 = second, -1 = last)
    public int? WeekOfMonth { get; set; }

    // MONTHLY (alternative): day of week in that week
    public DayOfWeek? DayOfWeekInMonth { get; set; }

    // YEARLY: specific month (1-12)
    public int? MonthOfYear { get; set; }

    // End conditions
    public RecurrenceEndType EndType { get; set; } // Never, AfterOccurrences, OnDate
    public int? OccurrenceCount { get; set; }
    public DateTime? EndDate { get; set; }

    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum RecurrenceFrequency
{
    None,
    Daily,
    Weekly,
    Monthly,
    Yearly,
    Custom
}

public enum RecurrenceEndType
{
    Never,
    AfterOccurrences,
    OnDate
}
