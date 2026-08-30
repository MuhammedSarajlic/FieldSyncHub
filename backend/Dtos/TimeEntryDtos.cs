using backend.Models;

namespace backend.Dtos;

public record CreateTimeEntryDto(TimeEntryType Type, DateTime ClockIn, string? Notes);
public record TimeEntryResponseDto(Guid Id, Guid JobId, Guid EmployeeId, DateTime ClockIn, DateTime? ClockOut, TimeEntryType Type, string? Notes);
