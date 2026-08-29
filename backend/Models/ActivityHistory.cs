using System.ComponentModel.DataAnnotations;

namespace backend.Models;

/// <summary>
/// One audit-log entry: who changed what, when. Originally bolted to Quote only
/// (via a QuoteId FK and no reference to the record it described), so "who deleted
/// this invoice" had no answer anywhere in the system. Generalised with
/// EntityType/EntityId/WorkspaceId so it can describe any record.
///
/// Two kinds of row land here:
///  - Generic rows written automatically by DataContext.SaveChanges for every
///    tracked mutation (see AuditWriter) - these always carry EntityType/EntityId
///    and never a QuoteId.
///  - Quote-specific rows written by QuoteService with richer, human-authored
///    semantics ("marked sent", "added attachment X"), which additionally carry
///    the QuoteId that drives the quote timeline UI.
/// </summary>
public class ActivityHistory
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>For generic rows: Created/Updated/Deleted. For quote-specific rows:
    /// the QuoteActivityType name (QuoteSent, AttachmentAdded, ...).</summary>
    public string Type { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;

    /// <summary>The CLR name of the record this describes ("Invoice", "Job", ...).
    /// Empty only on rows written before this column existed.</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>The id of the record this describes - still readable after the
    /// record itself is deleted, which is the whole point of a delete audit.</summary>
    public Guid EntityId { get; set; }

    /// <summary>Scopes the log to one tenant. Nullable because a few audited
    /// records (a User before onboarding) legitimately have no workspace yet.</summary>
    public Guid? WorkspaceId { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public Guid ChangedBy { get; set; }
    public string ChangedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
