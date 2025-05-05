using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;

namespace backend.Services.NotesService;

public interface INotesService
{
    Task<ApiResponse<List<Notes>>> GetNotes();
    Task<ApiResponse<Notes>> GetNoteById(Guid id);
    Task<ApiResponse<List<Notes>>> GetNoteByCustomerId(Guid customerId);
    Task AddNote(AddNotesDto newNote);
    Task UpdateNote(Notes updatedNote);
    Task DeleteNote(Guid id);
}