using backend.Dtos.RequestDto;
using backend.Models.RequestModels;
using backend.Response;
using backend.Services.RequestService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/request")]
public class RequestController : ControllerBase
{
    private readonly IRequestService _requestService;

    public RequestController(IRequestService requestService)
    {
        _requestService = requestService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<Request>>>> GetAllRequests()
    {
        var requests = await _requestService.GetAllRequests();
        return Ok(requests);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<Request>>> GetRequestById(Guid id)
    {
        var request = await _requestService.GetRequestById(id);
        return Ok(request);
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<ApiResponse<List<Request>>>> GetRequestsByWorkspaceId(Guid workspaceId)
    {
        var requests = await _requestService.GetRequestsByWorkspaceId(workspaceId);
        return Ok(requests);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<List<Request>>>> GetRequestsByCustomerId(Guid customerId)
    {
        var requests = await _requestService.GetRequestByCustomerId(customerId);
        return Ok(requests);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Request>>> CreateRequest([FromBody] CreateRequestDto createRequestDto)
    {
        var result = await _requestService.CreateRequest(createRequestDto);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<Request>>> UpdateRequest([FromBody] UpdateRequestDto updatedRequestDto)
    {
        var result = await _requestService.UpdateRequest(updatedRequestDto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRequest(Guid id)
    {
        await _requestService.DeleteRequest(id);
        return Ok();
    }
}
