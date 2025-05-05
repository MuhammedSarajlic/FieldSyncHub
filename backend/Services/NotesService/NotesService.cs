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

    public async Task AddNote(AddNotesDto newNote)
    {
        // Step 1: Create a new note from the DTO.
        var note = newNote.Adapt<Notes>();
        note.Id = Guid.NewGuid();  // Assign a new GUID to the note
        note.CustomerId = newNote.CustomerId;  // Associate the note with the customer

        // Step 2: Find the customer using the CustomerId
        var customer = await _context.Customers
            .Where(c => c.CustomerId == newNote.CustomerId)
            .Include(c => c.Notes)  // Ensure we include the Notes collection of the customer
            .FirstOrDefaultAsync();

        if (customer == null)
        {
            throw new Exception("Customer not found");
        }

        // Step 3: Add the new note to the Notes collection of the customer
        await _context.Notes.AddAsync(note);
        customer.Notes.Add(note);  // Connect the new note to the customer

        // Step 4: Save the changes to the database
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

    public async Task<ApiResponse<List<Notes>>> GetNoteByCustomerId(Guid customerId)
    {
        var notes = await _context.Notes.Where(n => n.CustomerId == customerId).ToListAsync();
        return new ApiResponse<List<Notes>>()
        {
            Success = true,
            Payload = notes,
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