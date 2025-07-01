using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;
using backend.Services.NotesService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/notes")]
public class NoteController : ControllerBase
{
    private readonly INotesService _notesService;

    public NoteController(INotesService notesService)
    {
        _notesService = notesService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<Note>>> GetNotes()
    {
        return await _notesService.GetNotes();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<Note>> GetNoteById(Guid id)
    {
        return await _notesService.GetNoteById(id);
    }

    [HttpGet("{customerId}/customer")]
    public async Task<ApiResponse<List<Note>>> GetNoteByCustomerId(Guid customerId)
    {
        return await _notesService.GetNoteByCustomerId(customerId);
    }

    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote([FromBody] CreateNoteDto createNoteDto)
    {
        var note = await _notesService.CreateNote(createNoteDto);
        return Ok(note);
    }


    [HttpPut]
    public async Task<ActionResult<Note>> UpdateNote([FromQuery] UpdateNoteDto updatedNoteDto)
    {
        var udpatedNote = await _notesService.UpdateNote(updatedNoteDto);
        return Ok(udpatedNote);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNote(Guid id)
    {
        await _notesService.DeleteNote(id);
        return Ok();
    }
}