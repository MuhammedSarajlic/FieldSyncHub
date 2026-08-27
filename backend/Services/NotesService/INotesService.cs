using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;

namespace backend.Services.NotesService;

public interface INotesService
{
    Task<ApiResponse<Note>> GetNoteById(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<List<Note>>> GetNoteByCustomerId(Guid customerId, Guid callerWorkspaceId);
    Task<Note> CreateNote(CreateNoteDto createNoteDto, Guid callerWorkspaceId);
    Task<Note> UpdateNote(UpdateNoteDto updatedNoteDto, Guid callerWorkspaceId);
    Task DeleteNote(Guid id, Guid callerWorkspaceId);
}