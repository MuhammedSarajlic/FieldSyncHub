using backend.Data;
using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using Mapster;
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

        public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(Guid? workspaceId, string? position, string? department, string? status, DateTime? hireDateStart, DateTime? hireDateEnd, string? sortBy, string? sort)
        {
            var queryable = _context.Employees.AsQueryable();

            // 🔍 Filter: WorkspaceId
            if (workspaceId.HasValue && workspaceId != Guid.Empty)
            {
                queryable = queryable.Where(e => e.WorkspaceId == workspaceId);
            }

            // 🔍 Filter: Position
            if (!string.IsNullOrWhiteSpace(position))
            {
                queryable = queryable.Where(e => e.Position != null && e.Position.Contains(position));
            }

            // 🔍 Filter: Department
            if (!string.IsNullOrWhiteSpace(department))
            {
                queryable = queryable.Where(e => e.Department != null && e.Department.Contains(department));
            }

            // 🔍 Filter: Status
            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                queryable = queryable.Where(e => e.Status.ToLower() == status.ToLower());
            }

            // 🔍 Filter: Hire Date Range
            if (hireDateStart.HasValue)
            {
                queryable = queryable.Where(e => e.HireDate >= hireDateStart.Value);
            }
            if (hireDateEnd.HasValue)
            {
                queryable = queryable.Where(e => e.HireDate <= hireDateEnd.Value);
            }

            // 🔄 Sorting
            queryable = sortBy?.ToLower() switch
            {
                "hiredate" => sort == "desc" ? queryable.OrderByDescending(e => e.HireDate) : queryable.OrderBy(e => e.HireDate),
                "position" => sort == "desc" ? queryable.OrderByDescending(e => e.Position) : queryable.OrderBy(e => e.Position),
                "department" => sort == "desc" ? queryable.OrderByDescending(e => e.Department) : queryable.OrderBy(e => e.Department),
                _ => queryable.OrderBy(e => e.HireDate) // default sorting
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
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id);
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