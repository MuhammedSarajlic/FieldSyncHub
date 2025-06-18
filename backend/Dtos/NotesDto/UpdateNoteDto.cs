namespace backend.Dtos.NotesDto;

public class UpdateNoteDto
{
    public Guid Id { get; set; }
    public string? NoteText { get; set; }
    public string? PathFile { get; set; }
}