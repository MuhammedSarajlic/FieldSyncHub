using System.ComponentModel.DataAnnotations;

namespace backend.Models;

/// <summary>
/// One row per refresh token issued, keyed by the token's own jti claim. Access
/// tokens are never persisted here - they're short-lived and self-expiring by
/// design. This table exists purely so logout and password change can revoke an
/// outstanding refresh token (or all of a user's) before its natural expiry.
/// </summary>
public class RefreshToken
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? WorkspaceId { get; set; }
    public User? User { get; set; }
    public bool RememberMe { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
}
