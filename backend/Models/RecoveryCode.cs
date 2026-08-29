using System.ComponentModel.DataAnnotations;

namespace backend.Models;

/// <summary>
/// One single-use two-factor recovery code. Only the hash is ever stored - the
/// plaintext code is shown to the user exactly once, right after enrollment.
/// </summary>
public class RecoveryCode
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string CodeHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UsedAt { get; set; }
}
