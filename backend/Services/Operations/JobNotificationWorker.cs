using backend.Data;
using backend.Services.EmailService;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Operations;

public sealed class JobNotificationWorker(IServiceScopeFactory scopeFactory, ILogger<JobNotificationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                var email = scope.ServiceProvider.GetRequiredService<IEmailService>();
                var now = DateTime.UtcNow;
                var expiredWorkspaces = await db.Workspaces.IgnoreQueryFilters().Where(w => w.IsDeleted && w.PurgeAfter <= now).ToListAsync(stoppingToken);
                foreach (var workspace in expiredWorkspaces)
                {
                    db.Customers.RemoveRange(await db.Customers.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Jobs.RemoveRange(await db.Jobs.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Quotes.RemoveRange(await db.Quotes.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Invoices.RemoveRange(await db.Invoices.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.ServiceItems.RemoveRange(await db.ServiceItems.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Leads.RemoveRange(await db.Leads.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Events.RemoveRange(await db.Events.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Employees.RemoveRange(await db.Employees.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Workspaces.Remove(workspace);
                }
                var jobs = await db.Jobs.Include(j => j.Customer).ThenInclude(c => c!.EmailRecords).Where(j =>
                    (j.SendReminder && !j.ReminderSent) || (j.ConfirmationSent == false && j.StartDateTime > now)).ToListAsync(stoppingToken);
                foreach (var job in jobs)
                {
                    var address = job.Customer?.Emails?.FirstOrDefault();
                    if (string.IsNullOrWhiteSpace(address) || !email.IsConfigured) continue;
                    if (job.SendReminder && !job.ReminderSent && job.StartDateTime <= now.AddDays(Math.Max(0, job.ReminderDaysBefore)))
                    {
                        await email.SendEmailAsync(address, $"Reminder: {job.Title}", $"Reminder: your appointment is scheduled for {job.StartDateTime:u}.", $"<p>Reminder: your appointment is scheduled for <strong>{job.StartDateTime:u}</strong>.</p>");
                        job.ReminderSent = true;
                    }
                    if (!job.ConfirmationSent && job.StartDateTime > now)
                    {
                        await email.SendEmailAsync(address, $"Appointment confirmed: {job.Title}", $"Your appointment is scheduled for {job.StartDateTime:u}.", $"<p>Your appointment is scheduled for <strong>{job.StartDateTime:u}</strong>.</p>");
                        job.ConfirmationSent = true;
                    }
                }
                await db.SaveChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
            catch (Exception ex) { logger.LogError(ex, "Job notification worker failed"); }
            if (!await timer.WaitForNextTickAsync(stoppingToken))
            {
                break;
            }
        }
    }
}
