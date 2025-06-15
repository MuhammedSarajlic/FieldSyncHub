using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;

namespace backend.Services.NotesService;

public interface INotesService
{
    Task<ApiResponse<List<Note>>> GetNotes();
    Task<ApiResponse<Note>> GetNoteById(Guid id);
    Task<ApiResponse<List<Note>>> GetNoteByCustomerId(Guid customerId);
    Task<Note> CreateNote(CreateNoteDto createNoteDto);
    Task<Note> UpdateNote(UpdateNoteDto updatedNote);
    Task DeleteNote(Guid id);
}