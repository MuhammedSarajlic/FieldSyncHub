using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using backend.Services.EmployeeService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/employee")]
    public class EmployeeController : Controller
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<ApiResponse<List<Employee>>> GetEmployees()
        {
            return await _employeeService.GetEmployees();
        }

        [HttpGet("{id:guid}")]
        public async Task<ApiResponse<Employee>> GetEmployeesById(Guid id)
        {
            return await _employeeService.GetEmployeesById(id);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEmployee([FromBody] UpdateEmployeeDto updatedEmployee)
        {
            await _employeeService.UpdateEmployee(updatedEmployee);
            return Ok();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteEmployee(Guid id)
        {
            await _employeeService.DeleteEmployee(id);
            return Ok();
        }

        [HttpGet("filter")]
        public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter(
        [FromQuery] Guid? workspaceId,
        [FromQuery] string? position,
        [FromQuery] string? department,
        [FromQuery] string? status,
        [FromQuery] DateTime? hireDateStart,
        [FromQuery] DateTime? hireDateEnd,
        [FromQuery] string? sortBy,
        [FromQuery] string? sort)
        {
            return await _employeeService.GetEmployeesByFilter(
                workspaceId, position, department, status, hireDateStart, hireDateEnd, sortBy, sort
            );
        }
    }
}