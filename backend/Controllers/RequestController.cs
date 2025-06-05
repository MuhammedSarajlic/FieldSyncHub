using backend.Dtos.RequestDto;
using backend.Models.Request;
using backend.Services.RequestService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/request")]
    public class RequestController : Controller
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Request>>> GetAllRequests()
        {
            return Ok(await _requestService.GetAllRequests());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Request>> GetRequestById(Guid id)
        {
            var request = await _requestService.GetRequestById(id);
            if (request == null)
                return NotFound();

            return Ok(request);
        }

        [HttpGet("workspace/{workspaceId}")]
        public async Task<ActionResult<List<Request>>> GetRequestsByWorkspaceId(Guid workspaceId)
        {
            return Ok(await _requestService.GetRequestsByWorkspaceId(workspaceId));
        }

        [HttpPut]
        public async Task<ActionResult> UpdateRequest([FromBody] UpdateRequestDto updatedRequest)
        {
            await _requestService.UpdateRequest(updatedRequest);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRequest(Guid id)
        {
            var result = await _requestService.DeleteRequest(id);
            if (!result)
                return NotFound("Request not found.");

            return NoContent();
        }
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDto createRequestDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _requestService.CreateRequest(createRequestDto);

            if (result == null)
                return StatusCode(500, "Something went wrong while creating the request.");

            return Ok(result);
        }
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<Request>>> GetRequestsByCustomerId(Guid customerId)
        {
            return Ok(await _requestService.GetRequestByCustomerId(customerId));
        }
    }
}
