using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.NotesService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/note")]
public class NoteController : ControllerBase
{
    private readonly INotesService _notesService;
    private readonly ICurrentUser _currentUser;

    public NoteController(INotesService notesService, ICurrentUser currentUser)
    {
        _notesService = notesService;
        _currentUser = currentUser;
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<Note>>> GetNoteById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _notesService.GetNoteById(id, callerWorkspaceId));
    }

    [HttpGet("{customerId:guid}/customer")]
    public async Task<ActionResult<ApiResponse<List<Note>>>> GetNoteByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _notesService.GetNoteByCustomerId(customerId, callerWorkspaceId));
    }

    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote([FromBody] CreateNoteDto createNoteDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var note = await _notesService.CreateNote(createNoteDto, callerWorkspaceId);
        return Ok(note);
    }


    [HttpPut]
    public async Task<ActionResult<Note>> UpdateNote([FromBody] UpdateNoteDto updatedNoteDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var udpatedNote = await _notesService.UpdateNote(updatedNoteDto, callerWorkspaceId);
        return Ok(udpatedNote);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> DeleteNote(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _notesService.DeleteNote(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        return Ok();
    }
}
