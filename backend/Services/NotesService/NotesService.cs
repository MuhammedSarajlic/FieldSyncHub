using backend.Data;
using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;
using backend.Services.StorageService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.NotesService;

public class NotesService : INotesService
{
    private readonly DataContext _context;
    private readonly IStorageService _storageService;
    public NotesService(DataContext context, IStorageService storageService)
    {
        _context = context;
        _storageService = storageService;
    }

    public async Task<ApiResponse<Note>> GetNoteById(Guid id, Guid callerWorkspaceId)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id && n.WorkspaceId == callerWorkspaceId);
        if (note != null)
        {
            note.PathFile = await _storageService.ResolveAsync(note.PathFile);
        }
        return new ApiResponse<Note>()
        {
            Success = true,
            Payload = note,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Note>>> GetNoteByCustomerId(Guid customerId, Guid callerWorkspaceId)
    {
        // Customer <-> Note is many-to-many (CustomerNotes join table, see
        // DataContext.OnModelCreating) rather than a direct FK on Note, so
        // this goes through Customer.Notes instead of a Note.CustomerId that
        // doesn't exist on the model.
        var notes = await _context.Customers
            .Where(c => c.Id == customerId && c.WorkspaceId == callerWorkspaceId)
            .SelectMany(c => c.Notes!)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        foreach (var note in notes)
        {
            note.PathFile = await _storageService.ResolveAsync(note.PathFile);
        }

        return new ApiResponse<List<Note>>()
        {
            Success = true,
            Payload = notes,
            ErrorMessage = null
        };
    }

    public async Task<Note> CreateNote(CreateNoteDto createNoteDto, Guid callerWorkspaceId)
    {
        var note = createNoteDto.Adapt<Note>();
        note.Id = Guid.NewGuid();
        note.WorkspaceId = callerWorkspaceId;

        // Only accept a path this caller actually uploaded for their own workspace -
        // never an arbitrary client-supplied URL.
        if (!string.IsNullOrWhiteSpace(note.PathFile) && !UploadPolicy.IsOwnedBy(note.PathFile, callerWorkspaceId, null))
        {
            note.PathFile = null;
        }

        await _context.Notes.AddAsync(note);

        if (createNoteDto.CustomerId.HasValue)
        {
            var customer = await _context.Customers
                .Include(c => c.Notes)
                .FirstOrDefaultAsync(c => c.Id == createNoteDto.CustomerId.Value && c.WorkspaceId == callerWorkspaceId);
            customer?.Notes?.Add(note);
        }

        await _context.SaveChangesAsync();

        note.PathFile = await _storageService.ResolveAsync(note.PathFile);
        return note;
    }

    public async Task<Note> UpdateNote(UpdateNoteDto updatedNoteDto, Guid callerWorkspaceId)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == updatedNoteDto.Id);

        if (note == null || note.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Note with ID {updatedNoteDto.Id} not found.");
        }

        note.NoteText = updatedNoteDto.NoteText ?? note.NoteText;
        if (!string.IsNullOrWhiteSpace(updatedNoteDto.PathFile) && UploadPolicy.IsOwnedBy(updatedNoteDto.PathFile, callerWorkspaceId, null))
        {
            note.PathFile = updatedNoteDto.PathFile;
        }
        note.UpdatedAt = DateTime.UtcNow;

        _context.Update(note);
        await _context.SaveChangesAsync();

        note.PathFile = await _storageService.ResolveAsync(note.PathFile);
        return note;
    }

    public async Task DeleteNote(Guid id, Guid callerWorkspaceId)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
        if (note == null || note.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That note is not in your workspace.");
        }
        _context.Remove(note);
        await _context.SaveChangesAsync();
    }
}