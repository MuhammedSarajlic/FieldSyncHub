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

    public async Task<ApiResponse<List<Notes>>> GetNoteByCustomerId(Guid customerId)
    {
        var notes = await _context.Notes.Where(n => n.CustomerId == customerId)
                                        .OrderByDescending(n => n.CreatedAt)
                                        .ToListAsync();

        return new ApiResponse<List<Notes>>()
        {
            Success = true,
            Payload = notes,
            ErrorMessage = null
        };
    }

    public async Task AddNote(AddNotesDto newNote)
    {
        var note = newNote.Adapt<Notes>();
        note.Id = Guid.NewGuid();
        note.CustomerId = newNote.CustomerId;

        var customer = await _context.Customers
            .Where(c => c.Id == newNote.CustomerId)
            .Include(c => c.Notes)
            .FirstOrDefaultAsync();

        if (customer == null)
        {
            throw new Exception("Customer not found");
        }

        await _context.Notes.AddAsync(note);
        customer.Notes.Add(note);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteNote(Guid id)
    {
        var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
        _context.Remove(note);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateNote(Notes updatedNote)
    {
        _context.Update(updatedNote);
        await _context.SaveChangesAsync();
    }
}