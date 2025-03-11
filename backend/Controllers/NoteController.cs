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

    [HttpPost]
    public async Task<IActionResult> AddNote([FromBody] AddNotesDto newNote, Guid customerID)
    {
        await _notesService.AddNote(newNote, customerID);
        return Ok();
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