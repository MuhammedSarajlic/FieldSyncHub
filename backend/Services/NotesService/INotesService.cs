using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;

namespace backend.Services.NotesService;

public interface INotesService
{
    Task<ApiResponse<List<Notes>>> GetNotes();
    Task<ApiResponse<Notes>> GetNoteById(Guid id);
    Task AddNote(AddNotesDto newNote, Guid customerId);
    Task UpdateNote(Notes updatedNote);
    Task DeleteNote(Guid id);
}