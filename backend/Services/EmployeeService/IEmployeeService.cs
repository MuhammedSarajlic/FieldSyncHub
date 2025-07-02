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
        Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(EmployeeFilterDto employeeFilterDto, Guid workspaceId);
        Task<EmployeeStatsDto> GetEmployeeStatsAsync(Guid workspaceId);
        Task<ActionResult<Employee>> CreateEmployee(CreateEmployeeDto createEmployeeDto);
        Task<Employee> UpdateEmployee(UpdateEmployeeDto updateEmployeeDto);
        Task DeleteEmployee(Guid id);
        Task<IActionResult> ExportEmployees(Guid workspaceId);
    }
}