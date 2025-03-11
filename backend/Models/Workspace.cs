using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Workspace
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? CreatedBy { get; set; }
    
    [NotMapped]
    public User? User { get; set; }
}