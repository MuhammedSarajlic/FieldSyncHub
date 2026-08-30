using backend.Data;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.SmsService;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Operations;

public sealed class JobNotificationWorker(IServiceScopeFactory scopeFactory, ILogger<JobNotificationWorker> logger, IConfiguration configuration) : BackgroundService
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
                var sms = scope.ServiceProvider.GetRequiredService<ISmsService>();
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
                    db.WorkspaceMemberships.RemoveRange(await db.WorkspaceMemberships.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.EmployeeInvites.RemoveRange(await db.EmployeeInvites.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.MarketingCampaigns.RemoveRange(await db.MarketingCampaigns.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.InventoryTransactions.RemoveRange(await db.InventoryTransactions.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.AccountingConnections.RemoveRange(await db.AccountingConnections.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.AccountingExternalRecords.RemoveRange(await db.AccountingExternalRecords.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.ApiKeys.RemoveRange(await db.ApiKeys.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.WebhookSubscriptions.RemoveRange(await db.WebhookSubscriptions.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Subscriptions.RemoveRange(await db.Subscriptions.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.DunningAttempts.RemoveRange(await db.DunningAttempts.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.ReviewRequests.RemoveRange(await db.ReviewRequests.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.TimeEntries.RemoveRange(await db.TimeEntries.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.ActivityHistorys.RemoveRange(await db.ActivityHistorys.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Notes.RemoveRange(await db.Notes.IgnoreQueryFilters().Where(x => x.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.CustomFieldValues.RemoveRange(await db.CustomFieldValues.IgnoreQueryFilters().Where(x => x.Customer != null && x.Customer.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.CustomerEmails.RemoveRange(await db.CustomerEmails.IgnoreQueryFilters().Where(x => x.Customer != null && x.Customer.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.CustomerTags.RemoveRange(await db.CustomerTags.IgnoreQueryFilters().Where(x => x.Customer != null && x.Customer.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.CustomerPhones.RemoveRange(await db.CustomerPhones.IgnoreQueryFilters().Where(x => x.Customer != null && x.Customer.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Properties.RemoveRange(await db.Properties.IgnoreQueryFilters().Where(x => x.Customer != null && x.Customer.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Payments.RemoveRange(await db.Payments.IgnoreQueryFilters().Where(x => (x.Invoice != null && x.Invoice.WorkspaceId == workspace.Id) || (x.Job != null && x.Job.WorkspaceId == workspace.Id)).ToListAsync(stoppingToken));
                    db.LineItems.RemoveRange(await db.LineItems.IgnoreQueryFilters().Where(x => (x.Invoice != null && x.Invoice.WorkspaceId == workspace.Id) || (x.Job != null && x.Job.WorkspaceId == workspace.Id) || (x.Quote != null && x.Quote.WorkspaceId == workspace.Id) || (x.Lead != null && x.Lead.WorkspaceId == workspace.Id)).ToListAsync(stoppingToken));
                    db.StatusChanges.RemoveRange(await db.StatusChanges.IgnoreQueryFilters().Where(x => x.Job != null && x.Job.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.QuoteAttachments.RemoveRange(await db.QuoteAttachments.IgnoreQueryFilters().Where(x => x.Quote != null && x.Quote.WorkspaceId == workspace.Id).ToListAsync(stoppingToken));
                    db.Workspaces.Remove(workspace);
                }
                var jobs = await db.Jobs.Include(j => j.Customer).ThenInclude(c => c!.EmailRecords).Include(j => j.Customer).ThenInclude(c => c!.CustomerPhones).Where(j =>
                    (j.SendReminder && !j.ReminderSent) || (j.ConfirmationSent == false && j.StartDateTime > now)).ToListAsync(stoppingToken);
                foreach (var job in jobs)
                {
                    var address = job.Customer?.Emails?.FirstOrDefault();
                    var phone = job.Customer?.CustomerPhones?.FirstOrDefault(p => p.IsReceiveMessage)?.PhoneNumber;
                    if (job.SendReminder && !job.ReminderSent && job.StartDateTime <= now.AddDays(Math.Max(0, job.ReminderDaysBefore)))
                    {
                        var text = $"Reminder: {job.Title} is scheduled for {job.StartDateTime:u}.";
                        var emailSent = !string.IsNullOrWhiteSpace(address) && email.IsConfigured && (await email.SendEmailAsync(address, $"Reminder: {job.Title}", text, $"<p>{text}</p>")).Success;
                        var smsSent = await sms.SendAsync(phone ?? string.Empty, text, stoppingToken);
                        job.ReminderSent = emailSent || smsSent;
                    }
                    if (!job.ConfirmationSent && job.StartDateTime > now)
                    {
                        var text = $"Appointment confirmed: {job.Title} is scheduled for {job.StartDateTime:u}.";
                        var emailSent = !string.IsNullOrWhiteSpace(address) && email.IsConfigured && (await email.SendEmailAsync(address, $"Appointment confirmed: {job.Title}", text, $"<p>{text}</p>")).Success;
                        var smsSent = await sms.SendAsync(phone ?? string.Empty, text, stoppingToken);
                        job.ConfirmationSent = emailSent || smsSent;
                    }
                }

                var reviewJobs = await db.Jobs
                    .Include(j => j.Customer).ThenInclude(c => c!.EmailRecords)
                    .Include(j => j.Customer).ThenInclude(c => c!.CustomerPhones)
                    .Where(j => j.Status == JobStatus.Completed && j.CompletedAt != null)
                    .ToListAsync(stoppingToken);
                foreach (var job in reviewJobs)
                {
                    var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == job.WorkspaceId, stoppingToken);
                    if (workspace is not { ReviewRequestsEnabled: true } || job.CompletedAt > now.AddHours(-Math.Max(0, workspace.ReviewRequestDelayHours))) continue;
                    var request = await db.ReviewRequests.FirstOrDefaultAsync(r => r.JobId == job.Id, stoppingToken);
                    var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
                    var isNewRequest = request == null;
                    if (request == null)
                    {
                        request = new ReviewRequest { Id = Guid.NewGuid(), WorkspaceId = job.WorkspaceId, JobId = job.Id, CustomerId = job.CustomerId, TokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))) };
                        db.ReviewRequests.Add(request);
                    }
                    if (request.SentAt != null) continue;
                    if (!isNewRequest) continue;
                    var frontendUrl = configuration["AppSettings:FrontendUrl"]?.TrimEnd('/') ?? "http://localhost:5173";
                    var link = $"{frontendUrl}/review/{token}";
                    var text = $"How did we do on {job.Title}? Share your feedback: {link}";
                    var address = job.Customer?.Emails?.FirstOrDefault();
                    var phone = job.Customer?.CustomerPhones?.FirstOrDefault(p => p.IsReceiveMessage)?.PhoneNumber;
                    var emailSent = !string.IsNullOrWhiteSpace(address) && email.IsConfigured && (await email.SendEmailAsync(address, "How did we do?", text, $"<p>{text}</p>")).Success;
                    var smsSent = await sms.SendAsync(phone ?? string.Empty, text, stoppingToken);
                    if (emailSent || smsSent) { request.SentAt = now; request.Channel = emailSent && smsSent ? "Email,SMS" : emailSent ? "Email" : "SMS"; }
                    else db.ReviewRequests.Remove(request);
                }
                await db.SaveChangesAsync(stoppingToken);

                var invoices = await db.Invoices
                      .Include(invoice => invoice.Customer).ThenInclude(customer => customer!.EmailRecords)
                      .Include(invoice => invoice.LineItems).Include(invoice => invoice.Payments)
                     .Where(invoice => invoice.DueDate < now && invoice.WorkflowStatus != InvoiceStatus.Draft)
                      .ToListAsync(stoppingToken);
                foreach (var invoice in invoices)
                {
                    // BalanceDue is intentionally derived from the payment ledger and
                    // cannot be translated to SQL, so filter it after loading the
                    // already narrow set of overdue invoices.
                    if (invoice.BalanceDue <= 0m) continue;
                    var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == invoice.WorkspaceId, stoppingToken);
                    if (workspace is not { DunningEnabled: true }) continue;
                    var daysOverdue = Math.Max(1, (int)Math.Floor((now - invoice.DueDate).TotalDays));
                    var ladder = workspace.DunningDays.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(value => int.TryParse(value.Trim(), out var days) ? days : 0).Where(days => days > 0);
                    foreach (var days in ladder.Where(days => days <= daysOverdue))
                    {
                        if (await db.DunningAttempts.AnyAsync(attempt => attempt.InvoiceId == invoice.Id && attempt.DaysOverdue == days, stoppingToken)) continue;
                        var address = invoice.Customer?.Emails.FirstOrDefault();
                        if (string.IsNullOrWhiteSpace(address) || !email.IsConfigured) continue;
                        var message = $"Invoice {invoice.InvoiceNumber} has an outstanding balance of {invoice.BalanceDue:0.00} and is {daysOverdue} days overdue.";
                        if (!(await email.SendEmailAsync(address, $"Payment reminder: {invoice.InvoiceNumber}", message, $"<p>{message}</p>")).Success) continue;
                        db.DunningAttempts.Add(new DunningAttempt { Id = Guid.NewGuid(), WorkspaceId = invoice.WorkspaceId, InvoiceId = invoice.Id, DaysOverdue = days, SentAt = now });
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
