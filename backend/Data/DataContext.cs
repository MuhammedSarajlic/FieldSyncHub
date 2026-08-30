using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.CurrentUserService;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class DataContext : DbContext
{
    // Bound per-request by DI (see AddScoped<ICurrentUser, CurrentUser> in
    // ServiceExtension) so the query filters below can be scoped to the caller's own
    // workspace. HasQueryFilter builds an expression tree, which can't contain a
    // null-propagating operator (CS8072), so _currentUser must never actually be null -
    // a DataContext built without going through DI (migrations via
    // DataContextFactory, background/seed code, most unit tests) gets a null-object
    // stand-in instead, whose WorkspaceId is always null. Every filter below treats a
    // null WorkspaceId as "don't restrict" rather than "restrict to nothing", so those
    // callers keep working exactly as before.
    private readonly ICurrentUser _currentUser;

    private sealed class NoAmbientWorkspace : ICurrentUser
    {
        public Guid? UserId => null;
        public Guid? WorkspaceId => null;
        public UserRole? Role => null;
    }

    public DataContext(DbContextOptions<DataContext> options) : this(options, new NoAmbientWorkspace())
    {
    }

    public DataContext(DbContextOptions<DataContext> options, ICurrentUser currentUser) : base(options)
    {
        _currentUser = currentUser;
    }
    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerEmail> CustomerEmails => Set<CustomerEmail>();
    public DbSet<CustomerTag> CustomerTags => Set<CustomerTag>();
    public DbSet<JobTag> JobTags => Set<JobTag>();
    public DbSet<CustomField> CustomFields => Set<CustomField>();
    public DbSet<CustomFieldValue> CustomFieldValues => Set<CustomFieldValue>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<CustomerPhone> CustomerPhones => Set<CustomerPhone>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<ServiceItem> ServiceItems => Set<ServiceItem>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<LineItem> LineItems => Set<LineItem>();
    public DbSet<StatusChange> StatusChanges => Set<StatusChange>();
    public DbSet<EmployeeInvite> EmployeeInvites => Set<EmployeeInvite>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<QuoteAttachment> QuoteAttachments => Set<QuoteAttachment>();
    public DbSet<ActivityHistory> ActivityHistorys => Set<ActivityHistory>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<RecurrenceRule> RecurrenceRules => Set<RecurrenceRule>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<RecoveryCode> RecoveryCodes => Set<RecoveryCode>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<ReviewRequest> ReviewRequests => Set<ReviewRequest>();

    /// <summary>
    /// Audit rows are collected from the change tracker before the save and added to
    /// the same transaction, so the log can't end up describing a mutation that was
    /// then rolled back - or miss one that succeeded.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        RecalculateTrackedDocumentTotals();
        var auditEntries = AuditWriter.Collect(ChangeTracker, _currentUser);
        if (auditEntries.Count > 0)
        {
            await ActivityHistorys.AddRangeAsync(auditEntries, cancellationToken);
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        RecalculateTrackedDocumentTotals();
        var auditEntries = AuditWriter.Collect(ChangeTracker, _currentUser);
        if (auditEntries.Count > 0)
        {
            ActivityHistorys.AddRange(auditEntries);
        }

        return base.SaveChanges();
    }

    private void RecalculateTrackedDocumentTotals()
    {
        foreach (var entry in ChangeTracker.Entries<Invoice>().Where(entry => entry.State != EntityState.Deleted))
        {
            if (entry.State == EntityState.Added || entry.Collection(invoice => invoice.LineItems).IsLoaded)
            {
                entry.Entity.RecalculateTotals();
            }
        }

        foreach (var entry in ChangeTracker.Entries<Job>().Where(entry => entry.State != EntityState.Deleted))
        {
            if (entry.State == EntityState.Added || entry.Collection(job => job.LineItems).IsLoaded)
            {
                entry.Entity.RecalculateTotals();
            }
        }

        foreach (var entry in ChangeTracker.Entries<Quote>().Where(entry => entry.State != EntityState.Deleted))
        {
            if (entry.State == EntityState.Added || entry.Collection(quote => quote.LineItems).IsLoaded)
            {
                entry.Entity.RecalculateTotals();
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Workspace → Users
        modelBuilder.Entity<Workspace>()
            .HasMany(w => w.Users)
            .WithOne(u => u.Workspace)
            .HasForeignKey(u => u.WorkspaceId)
            .IsRequired(false);
        modelBuilder.Entity<Workspace>().HasQueryFilter(w => !w.IsDeleted);
        modelBuilder.Entity<Job>().Property(j => j.RowVersion).IsRowVersion();
        modelBuilder.Entity<Quote>().Property(q => q.RowVersion).IsRowVersion();
        modelBuilder.Entity<Invoice>().Property(i => i.RowVersion).IsRowVersion();
        modelBuilder.Entity<Customer>().Property(c => c.RowVersion).IsRowVersion();

        // Workspace → CreatedByUser
        modelBuilder.Entity<Workspace>()
            .HasOne(w => w.CreatedByUser)
            .WithMany()
            .HasForeignKey(w => w.CreatedByUserId)
            .IsRequired(false);

        // Workspace → Employees
        modelBuilder.Entity<Workspace>()
            .HasMany<Employee>()
            .WithOne(e => e.Workspace)
            .HasForeignKey(e => e.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Customer → Properties (cascade)
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Properties)
            .WithOne(p => p.Customer)
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Notes)
            .WithMany()
            .UsingEntity(j => j.ToTable("CustomerNotes"));

        // Customer → CustomerPhones (cascade)
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.CustomerPhones)
            .WithOne(p => p.Customer)
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.EmailRecords)
            .WithOne(e => e.Customer)
            .HasForeignKey(e => e.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.TagRecords)
            .WithOne(t => t.Customer)
            .HasForeignKey(t => t.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Job>()
            .HasMany(j => j.TagRecords)
            .WithOne(t => t.Job)
            .HasForeignKey(t => t.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        // Customer → CustomFieldValues (cascade)
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.CustomFieldValues)
            .WithOne(v => v.Customer)
            .HasForeignKey(v => v.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quote → LineItems
        modelBuilder.Entity<Quote>()
            .HasMany(q => q.LineItems)
            .WithOne(li => li.Quote)
            .HasForeignKey(li => li.QuoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quote → Attachments
        modelBuilder.Entity<QuoteAttachment>()
            .HasOne(a => a.Quote)
            .WithMany(q => q.Attachments)
            .HasForeignKey(a => a.QuoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Invoice → LineItems
        modelBuilder.Entity<Invoice>()
            .HasMany(i => i.LineItems)
            .WithOne(li => li.Invoice)
            .HasForeignKey(li => li.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Invoice>()
            .HasMany(i => i.Payments)
            .WithOne(p => p.Invoice)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Job → Payments (deposit payments recorded directly against the job,
        // independent of any invoice it's later billed through)
        modelBuilder.Entity<Job>()
            .HasMany(j => j.Payments)
            .WithOne(p => p.Job)
            .HasForeignKey(p => p.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        // Job → LineItems
        modelBuilder.Entity<Job>()
            .HasMany(j => j.LineItems)
            .WithOne(li => li.Job)
            .HasForeignKey(li => li.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        // Lead → LineItems
        modelBuilder.Entity<Lead>()
            .HasMany(r => r.LineItems)
            .WithOne(li => li.Lead)
            .HasForeignKey(li => li.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        // Job → StatusChange
        modelBuilder.Entity<Job>()
            .HasMany(j => j.StatusHistory)
            .WithOne(s => s.Job)
            .HasForeignKey(s => s.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Job>()
            .HasMany(j => j.TimeEntries)
            .WithOne(t => t.Job)
            .HasForeignKey(t => t.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TimeEntry>()
            .HasOne(t => t.Employee)
            .WithMany()
            .HasForeignKey(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Quote ↔ Lead (optional)
        modelBuilder.Entity<Lead>()
            .HasOne(r => r.Quote)
            .WithMany()
            .HasForeignKey(r => r.QuoteId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Lead>()
            .HasOne(r => r.Customer)
            .WithMany()
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Quote>()
            .HasOne(q => q.Job)
            .WithMany()
            .HasForeignKey(q => q.JobId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Lead>()
            .HasOne(l => l.ConvertedToJob)
            .WithMany()
            .HasForeignKey(l => l.ConvertedToJobId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Customer)
            .WithMany()
            .HasForeignKey(e => e.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        //many-to-many job<->employee
        modelBuilder.Entity<Job>()
            .HasMany(j => j.AssignedTeamMembers)
            .WithMany()
            .UsingEntity(
                "JobAssignedEmployees",
                l => l.HasOne(typeof(Employee)).WithMany().HasForeignKey("EmployeeId").OnDelete(DeleteBehavior.Cascade),
                r => r.HasOne(typeof(Job)).WithMany().HasForeignKey("JobId").OnDelete(DeleteBehavior.Cascade)
            );

        // For Customer Notes associated with a Quote
        modelBuilder.Entity<Quote>()
            .HasMany(q => q.CustomerNotes)
            .WithMany()
            .UsingEntity(j => j.ToTable("QuoteCustomerNotes"));

        // For Internal Notes associated with a Quote
        modelBuilder.Entity<Quote>()
            .HasMany(q => q.InternalNotes)
            .WithMany()
            .UsingEntity(j => j.ToTable("QuoteInternalNotes"));

        modelBuilder.Entity<Event>()
            .HasMany(e => e.AssignedTo)
            .WithMany() // if Employee doesn’t have backref
            .UsingEntity(j => j.ToTable("EventEmployees")); // join table name

        ConfigureDecimalPrecision(modelBuilder);

        // Defence in depth behind the application-level workspace checks every
        // service already does: a forgotten .Where(WorkspaceId == ...) in a new query
        // can no longer leak another tenant's rows, because every query against these
        // DbSets gets this filter appended automatically. Guarded on _currentUser (and
        // its WorkspaceId) being null so it's a no-op - not "restrict to nothing" -
        // for migrations, seed/background code, and unit tests that build a
        // DataContext directly; code that legitimately needs cross-tenant access
        // (an eventual admin portal, a background worker) must call
        // .IgnoreQueryFilters() explicitly rather than this silently opening up.
        modelBuilder.Entity<Customer>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<Invoice>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<Job>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<Quote>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<ServiceItem>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<Employee>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<Lead>().HasQueryFilter(e => !e.IsArchived && (_currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId));
        modelBuilder.Entity<CustomField>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);
        modelBuilder.Entity<EmployeeInvite>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);
        modelBuilder.Entity<Event>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);
        modelBuilder.Entity<Note>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);
        modelBuilder.Entity<ActivityHistory>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);
        modelBuilder.Entity<TimeEntry>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);
        modelBuilder.Entity<ReviewRequest>().HasQueryFilter(e => _currentUser.WorkspaceId == null || e.WorkspaceId == _currentUser.WorkspaceId);

        // Indexes (only key performance fields)
        modelBuilder.Entity<Customer>().HasIndex(c => c.WorkspaceId);
        modelBuilder.Entity<Invoice>().HasIndex(i => new { i.WorkspaceId, i.InvoiceNumber }).IsUnique();
        modelBuilder.Entity<Payment>().HasIndex(p => new { p.InvoiceId, p.Status, p.PaidAt });
        modelBuilder.Entity<Payment>().HasIndex(p => new { p.JobId, p.Status, p.PaidAt });
        modelBuilder.Entity<Job>().HasIndex(j => new { j.WorkspaceId, j.JobNumber }).IsUnique();
        modelBuilder.Entity<Quote>().HasIndex(q => new { q.WorkspaceId, q.QuoteNumber }).IsUnique();
        modelBuilder.Entity<ServiceItem>().HasIndex(s => s.WorkspaceId);
        modelBuilder.Entity<ServiceItem>().HasIndex(s => new { s.WorkspaceId, s.SKU });
        modelBuilder.Entity<Employee>().HasIndex(e => e.WorkspaceId);
        modelBuilder.Entity<CustomerEmail>().HasIndex(e => new { e.CustomerId, e.Email }).IsUnique();
        modelBuilder.Entity<CustomerEmail>().HasIndex(e => e.Email);
        modelBuilder.Entity<CustomerTag>().HasIndex(t => new { t.CustomerId, t.Tag }).IsUnique();
        modelBuilder.Entity<JobTag>().HasIndex(t => new { t.JobId, t.Tag }).IsUnique();
        modelBuilder.Entity<CustomerEmail>().Property(e => e.Email).HasMaxLength(320);
        modelBuilder.Entity<CustomerTag>().Property(t => t.Tag).HasMaxLength(100);
        modelBuilder.Entity<JobTag>().Property(t => t.Tag).HasMaxLength(100);

        // Login and the email-change flow both assume at most one account per
        // address - enforce it at the database level too, not just in application code.
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.PasswordResetToken).HasMaxLength(64);
        modelBuilder.Entity<User>().HasIndex(u => u.PasswordResetToken);

        // Invite tokens are looked up on every acceptance and must be globally unique.
        modelBuilder.Entity<EmployeeInvite>().Property(i => i.Token).HasMaxLength(128);
        modelBuilder.Entity<EmployeeInvite>().HasIndex(i => i.Token).IsUnique();

        // Revoking every refresh token for a user (password change) queries by UserId.
        modelBuilder.Entity<RefreshToken>().HasIndex(r => r.UserId);

        // Validating a recovery code queries all of a user's unused codes.
        modelBuilder.Entity<RecoveryCode>().HasIndex(r => r.UserId);

        // The audit log is read two ways: "everything for this workspace" and
        // "the history of this one record" - both need to be fast even once the
        // table has years of rows in it.
        modelBuilder.Entity<ActivityHistory>().HasIndex(a => new { a.WorkspaceId, a.ChangedAt });
        modelBuilder.Entity<ActivityHistory>().HasIndex(a => new { a.EntityType, a.EntityId });
        modelBuilder.Entity<TimeEntry>().HasIndex(t => new { t.WorkspaceId, t.EmployeeId, t.ClockIn });
        modelBuilder.Entity<TimeEntry>().HasIndex(t => new { t.JobId, t.ClockOut });
        modelBuilder.Entity<ReviewRequest>().HasIndex(r => r.TokenHash).IsUnique();
        modelBuilder.Entity<ReviewRequest>().HasIndex(r => new { r.WorkspaceId, r.JobId }).IsUnique();
    }

    private static void ConfigureDecimalPrecision(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LineItem>().Property(li => li.UnitPrice).HasPrecision(19, 4);
        modelBuilder.Entity<LineItem>().Property(li => li.Cost).HasPrecision(19, 4);
        modelBuilder.Entity<LineItem>().Property(li => li.Quantity).HasPrecision(9, 3);
        modelBuilder.Entity<Property>().Property(p => p.Latitude).HasPrecision(9, 6);
        modelBuilder.Entity<Property>().Property(p => p.Longitude).HasPrecision(9, 6);

        modelBuilder.Entity<ServiceItem>().Property(si => si.UnitPrice).HasPrecision(19, 4);
        modelBuilder.Entity<ServiceItem>().Property(si => si.Cost).HasPrecision(19, 4);
        modelBuilder.Entity<ServiceItem>().Property(si => si.StockLevel).HasPrecision(19, 4);
        modelBuilder.Entity<ServiceItem>().Property(si => si.ReorderPoint).HasPrecision(19, 4);
        modelBuilder.Entity<ServiceItem>().Property(si => si.MarkupPercentage).HasPrecision(9, 6);
        modelBuilder.Entity<Employee>().Property(e => e.HourlyCostRate).HasPrecision(19, 4);
        modelBuilder.Entity<Employee>().Property(e => e.BillableRate).HasPrecision(19, 4);

            modelBuilder.Entity<Workspace>().Property(w => w.DefaultTaxRate).HasPrecision(9, 6);
            modelBuilder.Entity<Quote>().Property(q => q.DepositAmount).HasPrecision(19, 4);

        modelBuilder.Entity<Job>().Property(j => j.DepositAmount).HasPrecision(19, 4);
        modelBuilder.Entity<Job>().Property(j => j.DiscountValue).HasPrecision(19, 4);
        modelBuilder.Entity<Job>().Property(j => j.TaxRate).HasPrecision(9, 6);

        modelBuilder.Entity<Invoice>().Property(i => i.Discount).HasPrecision(19, 4);
        modelBuilder.Entity<Invoice>().Property(i => i.TaxRate).HasPrecision(9, 6);
        modelBuilder.Entity<Payment>().Property(p => p.Amount).HasPrecision(19, 4);

        modelBuilder.Entity<Quote>().Property(q => q.DiscountValue).HasPrecision(19, 4);
        modelBuilder.Entity<Quote>().Property(q => q.TaxRate).HasPrecision(9, 6);

        modelBuilder.Entity<Invoice>().Property(i => i.Subtotal).HasPrecision(19, 4);
        modelBuilder.Entity<Invoice>().Property(i => i.DiscountAmount).HasPrecision(19, 4);
        modelBuilder.Entity<Invoice>().Property(i => i.TaxAmount).HasPrecision(19, 4);
        modelBuilder.Entity<Invoice>().Property(i => i.Total).HasPrecision(19, 4);

        modelBuilder.Entity<Job>().Property(j => j.Subtotal).HasPrecision(19, 4);
        modelBuilder.Entity<Job>().Property(j => j.Discount).HasPrecision(19, 4);
        modelBuilder.Entity<Job>().Property(j => j.TaxAmount).HasPrecision(19, 4);
        modelBuilder.Entity<Job>().Property(j => j.TotalAmount).HasPrecision(19, 4);

        modelBuilder.Entity<Quote>().Property(q => q.Subtotal).HasPrecision(19, 4);
        modelBuilder.Entity<Quote>().Property(q => q.Discount).HasPrecision(19, 4);
        modelBuilder.Entity<Quote>().Property(q => q.TaxAmount).HasPrecision(19, 4);
        modelBuilder.Entity<Quote>().Property(q => q.Total).HasPrecision(19, 4);
    }
}
