namespace backend.Dtos.NotesDto;

public class UpdateNoteDto : CreateNoteDto
{
    public Guid Id { get; set; }
}