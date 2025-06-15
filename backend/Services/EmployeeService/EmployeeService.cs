using System.Text;
using backend.Data;
using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.EmployeeService;

public class EmployeeService : IEmployeeService
{
    private readonly DataContext _context;
    public EmployeeService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Employee>>> GetEmployees()
    {
        var employees = await _context.Employees.ToListAsync();
        return new ApiResponse<List<Employee>>()
        {
            Success = true,
            Payload = employees,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Employee>> GetEmployeesById(Guid id)
    {
        var employee = await _context.Employees.Where(e => e.Id == id).Include(e => e.User).FirstOrDefaultAsync();
        return new ApiResponse<Employee>()
        {
            Success = true,
            Payload = employee,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Employee>>> GetEmployeesByWorkspaceId(Guid workspaceId)
    {
        var employees = await _context.Employees.Where(e => e.WorkspaceId == workspaceId)
                                                .Include(e => e.User)
                                                .ToListAsync();
        return new ApiResponse<List<Employee>>()
        {
            Success = true,
            Payload = employees,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(EmployeeFilterDto employeeFilterDto)
    {
        var queryable = _context.Employees.Include(e => e.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(employeeFilterDto.Q))
        {
            queryable = queryable.Where(e => e.User.FirstName.Contains(employeeFilterDto.Q) || e.User.LastName.Contains(employeeFilterDto.Q));
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
            queryable = queryable.Where(e => e.HireDate >= employeeFilterDto.HireDateMin.Value);
        }

        if (employeeFilterDto.HireDateMax.HasValue)
        {
            queryable = queryable.Where(e => e.HireDate <= employeeFilterDto.HireDateMax.Value);
        }

        queryable = employeeFilterDto.SortBy?.ToLower() switch
        {
            "name" => employeeFilterDto.Sort == "desc"
                ? queryable.OrderByDescending(e => e.User.FirstName)
                : queryable.OrderBy(e => e.User.FirstName),
            _ => queryable.OrderBy(e => e.User.FirstName)
        };

        var employees = await queryable.ToListAsync();

        return new ApiResponse<List<Employee>>
        {
            Success = true,
            Payload = employees
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

        return new ActionResult<Employee>(employee);
    }

    public async Task<Employee> UpdateEmployee(UpdateEmployeeDto updateEmployeeDto)
    {
        var employee = updateEmployeeDto.Adapt<Employee>();
        _context.Update(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task DeleteEmployee(Guid id)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);
        _context.Remove(employee);
        await _context.SaveChangesAsync();
    }

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