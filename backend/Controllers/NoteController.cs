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
    public async Task<ApiResponse<List<Notes>>> GetNotes()
    {
        return await _notesService.GetNotes();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<Notes>> GetNoteById(Guid id)
    {
        return await _notesService.GetNoteById(id);
    }

    [HttpGet("{customerId}/customer")]
    public async Task<ApiResponse<List<Notes>>> GetNoteByCustomerId(Guid customerId)
    {
        return await _notesService.GetNoteByCustomerId(customerId);
    }

    [HttpPost]
    public async Task<ActionResult<Notes>> AddNote([FromBody] AddNotesDto newNote)
    {
        var note = await _notesService.AddNote(newNote);
        return Ok(note);
    }


    [HttpPut]
    public async Task<IActionResult> UpdateNote([FromQuery] Notes updatedNote)
    {
        await _notesService.UpdateNote(updatedNote);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNote(Guid id)
    {
        await _notesService.DeleteNote(id);
        return Ok();
    }
}