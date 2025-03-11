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
    public async Task AddNote(AddNotesDto newNote, Guid customerId)
    {
        var note = newNote.Adapt<Notes>();
        var customer = await _context.Customers.Where(c => c.CustomerId == customerId).Include(c => c.Notes).FirstOrDefaultAsync();
        newNote.Id = Guid.NewGuid();
        note.CustomerId = customerId;
        await _context.Notes.AddAsync(note);
        customer?.Notes?.Add(note);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteNote(Guid id)
    {
        var workspace = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
        _context.Remove(workspace);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<Notes>> GetNoteById(Guid id)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
        return new ApiResponse<Notes>()
        {
            Success = true,
            Payload = note,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Notes>>> GetNotes()
    {
        var notes = await _context.Notes.ToListAsync();
        return new ApiResponse<List<Notes>>()
        {
            Success = true,
            Payload = notes,
            ErrorMessage = null
        };
    }

    public async Task UpdateNote(Notes updatedNote)
    {
        _context.Update(updatedNote);
        await _context.SaveChangesAsync();
    }
}