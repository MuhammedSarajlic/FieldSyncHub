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
        var notes = await _context.Notes.Where(n => n.CustomerId == customerId)
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
        //Check this I think this should be there
        note.CustomerId = createNoteDto.CustomerId;

        var customer = await _context.Customers
            .Where(c => c.Id == createNoteDto.CustomerId)
            .Include(c => c.Notes)
            .FirstOrDefaultAsync();

        if (customer == null)
        {
            throw new Exception("Customer not found");
        }

        await _context.Notes.AddAsync(note);
        customer.Notes.Add(note);
        customer.LastActivity = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return note;
    }

    public async Task<Note> UpdateNote(UpdateNoteDto updatedNoteDto)
    {
        var note = updatedNoteDto.Adapt<Note>();
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