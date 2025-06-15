using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using backend.Services.EmployeeService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
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

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<List<Employee>>> GetEmployeesByWorkspaceId(Guid workspaceId)
    {
        return await _employeeService.GetEmployeesByWorkspaceId(workspaceId);
    }

    [HttpGet("filter")]
    public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter([FromQuery] EmployeeFilterDto employeeFilterDto)
    {
        return await _employeeService.GetEmployeesByFilter(employeeFilterDto);
    }


    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] CreateEmployeeDto createEmployeeDto)
    {
        var createdEmployee = await _employeeService.CreateEmployee(createEmployeeDto);
        return Ok(createdEmployee);
    }

    [HttpPut]
    public async Task<ActionResult<Employee>> UpdateEmployee([FromBody] UpdateEmployeeDto updateEmployeeDto)
    {
        var updatedEmployee = await _employeeService.UpdateEmployee(updateEmployeeDto);
        return Ok(updatedEmployee);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEmployee(Guid id)
    {
        await _employeeService.DeleteEmployee(id);
        return Ok();
    }

    [HttpGet("export/{workspaceId:guid}")]
    public async Task<IActionResult> ExportEmployees(Guid workspaceId)
    {
        return await _employeeService.ExportEmployees(workspaceId);
    }
}