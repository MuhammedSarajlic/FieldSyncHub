using backend.Models;
using backend.Models.QuoteModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }
    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
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
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<QuoteAttachment> QuoteAttachments => Set<QuoteAttachment>();
    public DbSet<ActivityHistory> ActivityHistorys => Set<ActivityHistory>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<RecurrenceRule> RecurrenceRules => Set<RecurrenceRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Workspace → Users
        modelBuilder.Entity<Workspace>()
            .HasMany(w => w.Users)
            .WithOne(u => u.Workspace)
            .HasForeignKey(u => u.WorkspaceId)
            .IsRequired(false);

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

        // Quote ↔ Lead (optional)
        modelBuilder.Entity<Lead>()
            .HasOne(r => r.Quote)
            .WithMany()
            .HasForeignKey(r => r.QuoteId)
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

        // Indexes (only key performance fields)
        modelBuilder.Entity<Customer>().HasIndex(c => c.WorkspaceId);
        modelBuilder.Entity<Invoice>().HasIndex(i => i.WorkspaceId);
        modelBuilder.Entity<Job>().HasIndex(j => j.WorkspaceId);
        modelBuilder.Entity<Quote>().HasIndex(q => q.WorkspaceId);
        modelBuilder.Entity<ServiceItem>().HasIndex(s => s.WorkspaceId);

        // Login and the email-change flow both assume at most one account per
        // address - enforce it at the database level too, not just in application code.
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }

}