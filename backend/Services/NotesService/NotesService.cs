using backend.Data;
using backend.Dtos.NotesDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.NotesService;

public class NotesService : INotesService
{
    private readonly DataContext _context;
    public NotesService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Note>>> GetNotes()
    {
        var notes = await _context.Notes.ToListAsync();
        return new ApiResponse<List<Note>>()
        {
            Success = true,
            Payload = notes,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Note>> GetNoteById(Guid id)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
        return new ApiResponse<Note>()
        {
            Success = true,
            Payload = note,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Note>>> GetNoteByCustomerId(Guid customerId)
    {
        // Customer <-> Note is many-to-many (CustomerNotes join table, see
        // DataContext.OnModelCreating) rather than a direct FK on Note, so
        // this goes through Customer.Notes instead of a Note.CustomerId that
        // doesn't exist on the model.
        var notes = await _context.Customers
            .Where(c => c.Id == customerId)
            .SelectMany(c => c.Notes!)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return new ApiResponse<List<Note>>()
        {
            Success = true,
            Payload = notes,
            ErrorMessage = null
        };
    }

    public async Task<Note> CreateNote(CreateNoteDto createNoteDto)
    {
        var note = createNoteDto.Adapt<Note>();
        note.Id = Guid.NewGuid();

        await _context.Notes.AddAsync(note);
        await _context.SaveChangesAsync();

        return note;
    }

    public async Task<Note> UpdateNote(UpdateNoteDto updatedNoteDto)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == updatedNoteDto.Id);

        note.NoteText = updatedNoteDto.NoteText ?? note.NoteText;
        note.PathFile = updatedNoteDto.PathFile ?? note.PathFile;
        note.UpdatedAt = DateTime.UtcNow;
        
        _context.Update(note);
        await _context.SaveChangesAsync();

        return note;
    }

    public async Task DeleteNote(Guid id)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
        _context.Remove(note);
        await _context.SaveChangesAsync();
    }
}