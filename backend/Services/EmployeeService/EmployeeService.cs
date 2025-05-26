using System.Text;
using backend.Data;
using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.EmployeeService
{
    public class EmployeeService : IEmployeeService
    {
        private readonly DataContext _context;
        public EmployeeService(DataContext context)
        {
            _context = context;
        }
        public async Task DeleteEmployee(Guid id)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);
            _context.Remove(employee);
            await _context.SaveChangesAsync();
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

        public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(string q, Guid? workspaceId, string? position, string? department, string? status, DateTime? hireDateMin, DateTime? hireDateMax, string? sortBy, string? sort)
        {
            var queryable = _context.Employees.Include(e => e.User).AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                queryable = queryable.Where(s => s.User.FirstName.Contains(q));
            }

            if (workspaceId.HasValue && workspaceId != Guid.Empty)
            {
                queryable = queryable.Where(e => e.WorkspaceId == workspaceId);
            }

            if (!string.IsNullOrWhiteSpace(position))
            {
                queryable = queryable.Where(e => e.Position != null && e.Position.Contains(position));
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                queryable = queryable.Where(e => e.Department != null && e.Department.Contains(department));
            }

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                queryable = queryable.Where(e => e.Status.ToLower() == status.ToLower());
            }

            if (hireDateMin.HasValue)
            {
                queryable = queryable.Where(e => e.HireDate >= hireDateMin.Value);
            }
            if (hireDateMax.HasValue)
            {
                queryable = queryable.Where(e => e.HireDate <= hireDateMax.Value);
            }

            queryable = sortBy?.ToLower() switch
            {
                "name" => sort == "desc" ? queryable.OrderByDescending(s => s.User.FirstName) : queryable.OrderBy(s => s.User.FirstName),
                _ => queryable.OrderBy(s => s.User.FirstName)
            };

            var employees = await queryable.ToListAsync();

            return new ApiResponse<List<Employee>>
            {
                Success = true,
                Payload = employees
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

        public async Task UpdateEmployee(UpdateEmployeeDto updatedEmployee)
        {
            var employee = updatedEmployee.Adapt<Employee>();
            _context.Update(employee);
            await _context.SaveChangesAsync();
        }
    }
}