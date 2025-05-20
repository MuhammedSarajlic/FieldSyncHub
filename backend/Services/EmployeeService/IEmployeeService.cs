using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;

namespace backend.Services.EmployeeService
{
    public interface IEmployeeService
    {
        Task<ApiResponse<List<Employee>>> GetEmployees();
        Task<ApiResponse<Employee>> GetEmployeesById(Guid id);
        Task<ApiResponse<List<Employee>>> GetEmployeesByWorkspaceId(Guid workspaceId);
        Task UpdateEmployee(UpdateEmployeeDto updatedEmployee);
        Task DeleteEmployee(Guid id);
        Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(
            Guid? workspaceId,
            string? position,
            string? department,
            string? status,
            DateTime? hireDateStart,
            DateTime? hireDateEnd,
            string? sortBy,
            string? sort);
    }
}