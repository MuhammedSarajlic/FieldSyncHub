using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.CurrentUserService;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace backend.Data;

/// <summary>
/// Builds audit rows from EF's change tracker rather than from hand-placed calls in
/// each service. Same reasoning as the SEC-12 query filters: a mutation added later
/// is audited automatically, so "write on every mutation" can't quietly rot as the
/// codebase grows. Reading the tracker also means deletes are captured with the
/// record's id and workspace still intact, which is exactly the case a
/// service-level hook is most likely to get wrong.
/// </summary>
public static class AuditWriter
{
    /// <summary>
    /// Top-level business records worth a "who touched this" answer. Deliberately an
    /// allow-list, not a deny-list: child rows (LineItem, StatusChange) churn on
    /// every parent edit and would bury the signal, and auth records (RefreshToken)
    /// would write a row on every single login and token refresh.
    /// ActivityHistory itself is absent for the obvious reason.
    /// </summary>
    private static readonly HashSet<Type> AuditedTypes =
    [
        typeof(Customer),
        typeof(Job),
        typeof(Invoice),
        typeof(Quote),
        typeof(Lead),
        typeof(Property),
        typeof(Note),
        typeof(ServiceItem),
        typeof(Employee),
        typeof(Event),
        typeof(Workspace),
        typeof(User),
        typeof(CustomField),
        typeof(EmployeeInvite),
    ];

    /// <summary>
    /// Property-level churn that says nothing about intent - logging it would make
    /// every row look "Updated" even when only a timestamp moved.
    /// </summary>
    private static readonly HashSet<string> NoiseProperties =
    [
        "UpdatedAt",
        "CreatedAt",
    ];

    /// <summary>
    /// Never name these in an audit row. The log is readable by anyone who can see
    /// the workspace's history, so it must not become a second place credentials or
    /// live tokens leak from - see SEC-16 and the email-change token flows.
    /// </summary>
    private static readonly HashSet<string> SensitiveProperties =
    [
        "PasswordHash",
        "PasswordResetToken",
        "PasswordResetTokenExpiresAt",
        "EmailChangeToken",
        "EmailChangeTokenExpiresAt",
        "GoogleId",
    ];

    public static List<ActivityHistory> Collect(ChangeTracker changeTracker, ICurrentUser currentUser)
    {
        // No authenticated actor means no "who" to record - migrations, seed code,
        // and unit tests that build a DataContext directly all land here, and an
        // audit row with an empty actor is noise rather than evidence.
        if (currentUser.UserId is not Guid actorId)
        {
            return [];
        }

        var entries = new List<ActivityHistory>();

        foreach (var entry in changeTracker.Entries())
        {
            if (!AuditedTypes.Contains(entry.Entity.GetType()))
            {
                continue;
            }

            var operation = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Modified => "Updated",
                EntityState.Deleted => "Deleted",
                _ => null
            };

            if (operation == null)
            {
                continue;
            }

            var entityType = entry.Entity.GetType().Name;
            var action = BuildAction(entry, operation, entityType);
            if (action == null)
            {
                continue;
            }

            entries.Add(new ActivityHistory
            {
                Id = Guid.NewGuid(),
                Type = operation,
                Action = action,
                EntityType = entityType,
                EntityId = ResolveEntityId(entry),
                WorkspaceId = ResolveWorkspaceId(entry, currentUser),
                ChangedBy = actorId,
                ChangedByName = string.Empty,
                ChangedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        return entries;
    }

    /// <summary>
    /// Returns null when an update turned out to be nothing but noise, so a
    /// touched-but-unchanged record doesn't manufacture an audit row.
    /// </summary>
    private static string? BuildAction(EntityEntry entry, string operation, string entityType)
    {
        if (operation != "Updated")
        {
            return $"{operation} {entityType}";
        }

        var changed = entry.Properties
            .Where(p => p.IsModified && !NoiseProperties.Contains(p.Metadata.Name))
            .Select(p => SensitiveProperties.Contains(p.Metadata.Name) ? $"{p.Metadata.Name} (redacted)" : p.Metadata.Name)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();

        if (changed.Count == 0)
        {
            return null;
        }

        // Property names only, never values: the point is "who changed the price",
        // not a second copy of every customer record's contents sitting in a table
        // with different access rules than the record itself.
        return $"Updated {entityType}: {string.Join(", ", changed)}";
    }

    private static Guid ResolveEntityId(EntityEntry entry)
    {
        var primaryKey = entry.Metadata.FindPrimaryKey()?.Properties.FirstOrDefault();
        if (primaryKey == null)
        {
            return Guid.Empty;
        }

        // On a delete the entity is gone after SaveChanges, so read the id now.
        var value = entry.Property(primaryKey.Name).CurrentValue;
        return value is Guid id ? id : Guid.Empty;
    }

    /// <summary>
    /// Prefers the record's own workspace over the actor's, so a row stays filed
    /// under the tenant it actually belongs to. Falls back to the actor's workspace
    /// for records that have no WorkspaceId column of their own.
    /// </summary>
    private static Guid? ResolveWorkspaceId(EntityEntry entry, ICurrentUser currentUser)
    {
        if (entry.Entity is Workspace workspace)
        {
            return workspace.Id;
        }

        var workspaceProperty = entry.Metadata.FindProperty("WorkspaceId");
        if (workspaceProperty != null)
        {
            var value = entry.Property(workspaceProperty.Name).CurrentValue;
            if (value is Guid ownWorkspaceId && ownWorkspaceId != Guid.Empty)
            {
                return ownWorkspaceId;
            }
        }

        return currentUser.WorkspaceId;
    }
}
