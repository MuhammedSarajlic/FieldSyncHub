using backend.Dtos.EmployeeDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.EmployeeService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/employee")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ICurrentUser _currentUser;

    public EmployeeController(IEmployeeService employeeService, ICurrentUser currentUser)
    {
        _employeeService = employeeService;
        _currentUser = currentUser;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<Employee>>> GetEmployeesById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _employeeService.GetEmployeesById(id, callerWorkspaceId));
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<List<Employee>>> GetEmployeesByWorkspaceId(Guid workspaceId)
    {
        return await _employeeService.GetEmployeesByWorkspaceId(workspaceId);
    }

    [HttpGet("workspace/{workspaceId}/filter")]
    public async Task<ApiResponse<List<Employee>>> GetEmployeesByFilter([FromQuery] EmployeeFilterDto employeeFilterDto, Guid workspaceId)
    {
        return await _employeeService.GetEmployeesByFilter(employeeFilterDto, workspaceId);
    }

    [HttpGet("{workspaceId}/stats")]
    public async Task<ActionResult<EmployeeStatsDto>> GetEmployeeStats(Guid workspaceId)
    {
        var stats = await _employeeService.GetEmployeeStatsAsync(workspaceId);
        return Ok(stats);
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
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var updatedEmployee = await _employeeService.UpdateEmployee(updateEmployeeDto, callerWorkspaceId);
        return Ok(updatedEmployee);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEmployee(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _employeeService.DeleteEmployee(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        return Ok();
    }

    [HttpGet("export/{workspaceId:guid}")]
    public async Task<IActionResult> ExportEmployees(Guid workspaceId)
    {
        return await _employeeService.ExportEmployees(workspaceId);
    }
}