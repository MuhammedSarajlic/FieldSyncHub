using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    public string LastName { get; set; } = string.Empty;
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";
    public Guid? WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }
    public ICollection<WorkspaceMembership> WorkspaceMemberships { get; set; } = [];
    public UserRole? Role { get; set; } = UserRole.Employee;
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiresAt { get; set; }
    public string? PendingEmail { get; set; }
    public string? EmailChangeToken { get; set; }
    public DateTime? EmailChangeTokenExpiresAt { get; set; }
    public bool TwoFactorEnabled { get; set; }
    // AES-GCM encrypted (see TotpSecretProtector) - never stored or logged in the
    // clear, since anyone who reads it out of a database dump could mint valid
    // codes indefinitely, unlike a one-time reset token.
    public string? TwoFactorSecretEncrypted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum UserRole
{
    Owner,
    Admin,
    Employee
}
