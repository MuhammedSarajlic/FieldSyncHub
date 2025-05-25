using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services.EmployeeService
{
    public interface IEmployeeService
    {
        Task<ApiResponse<List<Employee>>> GetEmployees();
        Task<ApiResponse<Employee>> GetEmployeesById(Guid id);
        Task<ApiResponse<List<Employee>>> GetEmployeesByWorkspaceId(Guid workspaceId);
        Task<IActionResult> ExportEmployees(Guid workspaceId);
        Task UpdateEmployee(UpdateEmployeeDto updatedEmployee);
        Task DeleteEmployee(Guid id);
        Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(
            string q,
            Guid? workspaceId,
            string? position,
            string? department,
            string? status,
            DateTime? hireDateMin,
            DateTime? hireDateMax,
            string? sortBy,
            string? sort);
    }
}