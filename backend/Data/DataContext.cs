using backend.Models;
using backend.Models.QuoteModels;
using backend.Models.RequestModels;
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
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<QuoteAttachment> QuoteAttachments => Set<QuoteAttachment>();
    public DbSet<ActivityHistory> ActivityHistorys => Set<ActivityHistory>();

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

        // Customer → Notes (cascade)
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Notes)
            .WithOne(n => n.Customer)
            .HasForeignKey(n => n.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

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

        // Request → LineItems
        modelBuilder.Entity<Request>()
            .HasMany(r => r.LineItems)
            .WithOne(li => li.Request)
            .HasForeignKey(li => li.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Job → StatusChange
        modelBuilder.Entity<Job>()
            .HasMany(j => j.StatusHistory)
            .WithOne(s => s.Job)
            .HasForeignKey(s => s.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quote ↔ Request (optional)
        modelBuilder.Entity<Request>()
            .HasOne(r => r.Quote)
            .WithMany()
            .HasForeignKey(r => r.QuoteId)
            .OnDelete(DeleteBehavior.SetNull); // keep quote, clear ref in request

        //many-to-many job<->employee
        modelBuilder.Entity<Job>()
        .HasMany(j => j.AssignedTeamMembers) // Job has many AssignedTeamMembers
        .WithMany() // Employees can be assigned to many Jobs (no navigation property on Employee side)
        // You can explicitly name the join table if you want more control:
        //.UsingEntity(j => j.ToTable("JobAssignedEmployees")) // Optional: name your join table

        // This is the CRUCIAL part for cascade deletes:
        // By default, many-to-many join tables often get Cascade on both sides.
        // But we need to ensure the foreign key *from the join table to Job* cascades its deletion.
        // The default for EF Core's implicit many-to-many is often Cascade.
        // If it's not working, we need to be more explicit about it or ensure the DB schema is clean.
        // Let's explicitly define how the join table relates to Job and Employee.
        // This implicitly handles the join table creation and behavior.
        .UsingEntity(
            "JobAssignedEmployees", // Name of the join table EF Core will create
            l => l.HasOne(typeof(Employee)).WithMany().HasForeignKey("EmployeeId").OnDelete(DeleteBehavior.Cascade),
            r => r.HasOne(typeof(Job)).WithMany().HasForeignKey("JobId").OnDelete(DeleteBehavior.Cascade)
        );

        // Indexes (only key performance fields)
        modelBuilder.Entity<Customer>().HasIndex(c => c.WorkspaceId);
        modelBuilder.Entity<Invoice>().HasIndex(i => i.WorkspaceId);
        modelBuilder.Entity<Job>().HasIndex(j => j.WorkspaceId);
        modelBuilder.Entity<Quote>().HasIndex(q => q.WorkspaceId);
        modelBuilder.Entity<ServiceItem>().HasIndex(s => s.WorkspaceId);
    }

}