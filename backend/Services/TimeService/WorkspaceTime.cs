namespace backend.Services.TimeService;

public static class WorkspaceTime
{
    public static DateTime ToUtc(DateTime value, string? timeZoneId)
    {
        if (value.Kind == DateTimeKind.Utc) return value;
        var zone = Find(timeZoneId);
        return TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(value, DateTimeKind.Unspecified), zone);
    }

    public static DateTime FromUtc(DateTime value, string? timeZoneId)
    {
        var zone = Find(timeZoneId);
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(value, DateTimeKind.Utc), zone);
    }

    private static TimeZoneInfo Find(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId)) return TimeZoneInfo.Utc;
        try { return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId); }
        catch { return TimeZoneInfo.Utc; }
    }
}
