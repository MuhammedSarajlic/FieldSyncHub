namespace backend.Dtos;

public record CompleteJobDto(string CompletionNote, string? CustomerSignaturePath, List<string>? CompletionPhotoPaths);
