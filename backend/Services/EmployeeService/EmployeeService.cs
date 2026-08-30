using System.Text;
using backend.Data;
using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.EmployeeService;

public class EmployeeService : IEmployeeService
{
    private static readonly TimeSpan ReferenceCacheDuration = TimeSpan.FromMinutes(2);
    private readonly DataContext _context;
    private readonly IMemoryCache? _cache;

    public EmployeeService(DataContext context, IMemoryCache? cache = null)
    {
        _context = context;
        _cache = cache;
    }

    // Resolves the Employee record backing a logged-in user, so callers whose role is
    // Employee can be scoped to only the jobs they're actually assigned to instead of
    // trusting an id supplied in the request.
    public async Task<Guid?> GetEmployeeIdForUserAsync(Guid userId, Guid workspaceId)
    {
        return await _context.Employees
            .Where(e => e.UserId == userId && e.WorkspaceId == workspaceId)
            .Select(e => (Guid?)e.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<ApiResponse<Employee>> GetEmployeesById(Guid id, Guid callerWorkspaceId)
    {
        var employee = await _context.Employees.Where(e => e.Id == id && e.WorkspaceId == callerWorkspaceId).Include(e => e.User).FirstOrDefaultAsync();
        return new ApiResponse<Employee>()
        {
            Success = true,
            Payload = employee,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Employee>>> GetEmployeesByWorkspaceId(Guid workspaceId)
    {
        var cacheKey = $"employees:{workspaceId}";
        if (_cache?.TryGetValue(cacheKey, out List<Employee>? cachedEmployees) == true && cachedEmployees != null)
        {
            return new ApiResponse<List<Employee>> { Success = true, Payload = cachedEmployees };
        }

        var employees = await _context.Employees.Where(e => e.WorkspaceId == workspaceId)
                                                .Include(e => e.User)
                                                .AsNoTracking()
                                                .ToListAsync();
        _cache?.Set(cacheKey, employees, ReferenceCacheDuration);
        return new ApiResponse<List<Employee>>()
        {
            Success = true,
            Payload = employees,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(EmployeeFilterDto employeeFilterDto, Guid workspaceId)
    {
        var queryable = _context.Employees.Where(e => e.WorkspaceId == workspaceId).Include(e => e.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(employeeFilterDto.Q))
        {
            queryable = queryable.Where(e => e.User!.FirstName.Contains(employeeFilterDto.Q) || e.User.LastName.Contains(employeeFilterDto.Q));
        }

        if (employeeFilterDto.WorkspaceId.HasValue && employeeFilterDto.WorkspaceId != Guid.Empty)
        {
            queryable = queryable.Where(e => e.WorkspaceId == employeeFilterDto.WorkspaceId);
        }

        if (!string.IsNullOrWhiteSpace(employeeFilterDto.Position))
        {
            queryable = queryable.Where(e => e.Position != null && e.Position.Contains(employeeFilterDto.Position));
        }

        if (!string.IsNullOrWhiteSpace(employeeFilterDto.Department))
        {
            queryable = queryable.Where(e => e.Department != null && e.Department.Contains(employeeFilterDto.Department));
        }

        if (!string.IsNullOrWhiteSpace(employeeFilterDto.Status) && employeeFilterDto.Status.ToLower() != "all")
        {
            queryable = queryable.Where(e => e.Status.ToString().ToLower() == employeeFilterDto.Status.ToLower());
        }

        if (employeeFilterDto.HireDateMin.HasValue)
        {
            var minUtc = DateTime.SpecifyKind(employeeFilterDto.HireDateMin.Value, DateTimeKind.Utc);
            queryable = queryable.Where(e => e.HireDate >= minUtc);
        }

        if (employeeFilterDto.HireDateMax.HasValue)
        {
            var endOfDay = employeeFilterDto.HireDateMax.Value.Date.AddDays(1).AddTicks(-1);
            var maxUtc = DateTime.SpecifyKind(endOfDay, DateTimeKind.Utc);
            queryable = queryable.Where(e => e.HireDate <= maxUtc);
        }

        queryable = employeeFilterDto.SortBy?.ToLower() switch
        {
            "name" => employeeFilterDto.Sort == "desc"
                ? queryable.OrderByDescending(e => e.User!.FirstName)
                : queryable.OrderBy(e => e.User!.FirstName),
            _ => queryable.OrderBy(e => e.User!.FirstName)
        };

        var employees = await queryable.ToListAsync();

        return new ApiResponse<List<Employee>>
        {
            Success = true,
            Payload = employees
        };
    }

    public async Task<EmployeeStatsDto> GetEmployeeStatsAsync(Guid workspaceId)
    {
        var now = DateTime.UtcNow;

        var employees = _context.Employees.Where(e => e.WorkspaceId == workspaceId);

        var total = await employees.CountAsync();
        var active = await employees.CountAsync(e => e.Status == EmployeeStatus.Active);
        var available = await employees.CountAsync(e => e.IsAvailable);
        var newHires = await employees.CountAsync(e =>
            e.HireDate.Month == now.Month && e.HireDate.Year == now.Year);

        return new EmployeeStatsDto
        {
            TotalEmployees = total,
            ActiveEmployees = active,
            AvailableEmployees = available,
            NewHiresThisMonth = newHires
        };
    }

    public async Task<ActionResult<Employee>> CreateEmployee(CreateEmployeeDto createEmployeeDto)
    {
        var employee = createEmployeeDto.Adapt<Employee>();
        employee.Id = Guid.NewGuid();
        employee.CreatedAt = DateTime.UtcNow;
        employee.UpdatedAt = DateTime.UtcNow;

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        InvalidateWorkspaceCache(employee.WorkspaceId);

        return new ActionResult<Employee>(employee);
    }

    //Fix update mothod
    public async Task<Employee> UpdateEmployee(UpdateEmployeeDto updateEmployeeDto, Guid callerWorkspaceId)
    {
        var existingEmployee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == updateEmployeeDto.Id);

        if (existingEmployee == null || existingEmployee.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Employee with ID {updateEmployeeDto.Id} not found.");
        }

        existingEmployee.Position = updateEmployeeDto.Position ?? existingEmployee.Position;
        existingEmployee.Department = updateEmployeeDto.Department ?? existingEmployee.Department;

        if (updateEmployeeDto.Status.HasValue)
        {
            existingEmployee.Status = updateEmployeeDto.Status.Value;
        }
        if (updateEmployeeDto.HireDate.HasValue)
        {
            existingEmployee.HireDate = updateEmployeeDto.HireDate.Value;
        }

        existingEmployee.PhoneNumber = updateEmployeeDto.PhoneNumber ?? existingEmployee.PhoneNumber;
        existingEmployee.ImageUrl = updateEmployeeDto.ImageUrl ?? existingEmployee.ImageUrl;
        existingEmployee.Location = updateEmployeeDto.Location ?? existingEmployee.Location;

        if (updateEmployeeDto.IsAvailable.HasValue)
        {
            existingEmployee.IsAvailable = updateEmployeeDto.IsAvailable.Value;
        }

        existingEmployee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        InvalidateWorkspaceCache(existingEmployee.WorkspaceId);

        return existingEmployee;
    }

    public async Task DeleteEmployee(Guid id, Guid callerWorkspaceId)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee == null || employee.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That employee is not in your workspace.");
        }
        _context.Remove(employee);
        await _context.SaveChangesAsync();
        InvalidateWorkspaceCache(employee.WorkspaceId);
    }

    private void InvalidateWorkspaceCache(Guid workspaceId)
        => _cache?.Remove($"employees:{workspaceId}");

    public async Task<IActionResult> ExportEmployees(Guid workspaceId)
    {
        var employees = await _context.Employees
            .Where(e => e.WorkspaceId == workspaceId)
            .Include(e => e.User)
            .ToListAsync();

        if (employees == null || !employees.Any())
        {
            return new NotFoundResult();
        }

        var sb = new StringBuilder();

        sb.AppendLine("EmployeeId,FirstName,LastName,Email,Position,Department,Status,HireDate,WorkspaceId");

        foreach (var employee in employees)
        {
            string hireDateFormatted = employee.HireDate.ToString("yyyy-MM-dd");
            sb.AppendLine($"{employee.Id},{employee.User?.FirstName},{employee.User?.LastName},{employee.User?.Email},{employee.Position},{employee.Department},{employee.Status},{hireDateFormatted},{employee.WorkspaceId}");
        }

        var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
        return new FileContentResult(csvBytes, "text/csv")
        {
            FileDownloadName = $"employees_workspace_{workspaceId}.csv"
        };
    }
}
