using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Dtos.JobDto;
using backend.Dtos.LineItemDto;
using backend.Models;
using backend.Response;
using backend.Services.InvoiceService;
using backend.Wrappers;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.JobService;

public class JobService : IJobService
{
    private const int MaxDocumentNumberGenerationAttempts = 5;
    private readonly DataContext _context;
    private readonly IInvoiceService _invoiceService;
    public JobService(DataContext context, IInvoiceService invoiceService)
    {
        _context = context;
        _invoiceService = invoiceService;
    }

    public async Task<ApiResponse<Job>> GetJobById(Guid jobId, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null)
    {
        var job = await _context.Jobs.Where(j => j.Id == jobId && j.WorkspaceId == callerWorkspaceId
                                        && (restrictToEmployeeId == null || j.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
                                    .Include(j => j.LineItems)
                                        .ThenInclude(l => l.ServiceItem)
                                    .Include(j => j.Customer)
                                        .ThenInclude(c => c!.CustomerPhones)
                                    .Include(j => j.Customer)
                                        .ThenInclude(c => c!.Properties)
                                    .Include(j => j.AssignedTeamMembers)
                                        .ThenInclude(a => a.User)
                                    .FirstOrDefaultAsync();
        return new ApiResponse<Job>()
        {
            Success = true,
            Payload = job,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null)
    {
        var jobs = await _context.Jobs.Where(j => j.CustomerId == customerId && j.WorkspaceId == callerWorkspaceId
                                        && (restrictToEmployeeId == null || j.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
                                    .Include(j => j.LineItems)
                                        .ThenInclude(li => li.ServiceItem)
                                    .Include(j => j.Property)
                                    .ToListAsync();

        return new ApiResponse<List<Job>> { Success = true, Payload = jobs };
    }

    public async Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId, Guid callerWorkspaceId)
    {
        var filteredJobs = await _context.Jobs.Include(j => j.AssignedTeamMembers)
                                            .Where(j => j.WorkspaceId == callerWorkspaceId && j.AssignedTeamMembers.Any(e => e.Id == employeeId))
                                            .Include(j => j.LineItems)
                                            .Include(j => j.Property)
                                            .Include(j => j.Customer)
                                            .ToListAsync();

        return new ApiResponse<List<Job>> { Success = true, Payload = filteredJobs };
    }

    public async Task<Job> GetJobByJobNumber(string jobNumber, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null)
    {
        var job = await _context.Jobs.Where(j => j.JobNumber == jobNumber && j.WorkspaceId == callerWorkspaceId
                                && (restrictToEmployeeId == null || j.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
                            .Include(j => j.LineItems)
                                .ThenInclude(l => l.ServiceItem)
                            .Include(j => j.Customer)
                                .ThenInclude(c => c!.CustomerPhones)
                            .Include(j => j.Customer)
                                .ThenInclude(c => c!.Properties)
                            .FirstOrDefaultAsync();

        return job ?? throw new Exception("Job not found");

    }

    public async Task<ApiResponse<PagedResult<Job>>> GetJobsByWorkspace(Guid workspaceId, int pageNumber, int pageSize, Guid? restrictToEmployeeId = null)
    {
        var query = _context.Jobs
            .Where(j => j.WorkspaceId == workspaceId
                && (restrictToEmployeeId == null || j.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
            .Include(j => j.Customer)
            .Include(j => j.Property)
            .Include(j => j.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .AsNoTracking();

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new ApiResponse<PagedResult<Job>>
        {
            Success = true,
            Payload = new PagedResult<Job>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task<ApiResponse<PagedResult<Job>>> GetJobsByFilter(
    JobFilterDto filterDto,
    Guid workspaceId,
    int pageNumber,
    int pageSize,
    Guid? restrictToEmployeeId = null)
    {
        var dbQuery = _context.Jobs
            .Where(j => j.WorkspaceId == workspaceId
                && (restrictToEmployeeId == null || j.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
            .AsNoTracking()
            .AsQueryable();

        if (filterDto.ScheduleDateMin.HasValue)
        {
            var minUtc = DateTime.SpecifyKind(filterDto.ScheduleDateMin.Value, DateTimeKind.Utc);
            dbQuery = dbQuery.Where(j => j.StartDateTime >= minUtc);
        }

        if (filterDto.ScheduleDateMax.HasValue)
        {
            var nextDayUtc = DateTime.SpecifyKind(filterDto.ScheduleDateMax.Value.Date.AddDays(1), DateTimeKind.Utc);
            dbQuery = dbQuery.Where(j => j.StartDateTime < nextDayUtc);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Priority) &&
            Enum.TryParse<JobPriority>(filterDto.Priority, true, out var priorityEnum))
        {
            dbQuery = dbQuery.Where(j => j.Priority == priorityEnum);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Status) &&
            Enum.TryParse<JobStatus>(filterDto.Status, true, out var statusEnum))
        {
            dbQuery = dbQuery.Where(j => j.Status == statusEnum);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            var q = filterDto.Q.Trim().ToLower();
            dbQuery = dbQuery.Where(j =>
                j.JobNumber.ToLower().Contains(q) ||
                (j.Customer != null && (j.Customer.FirstName.ToLower().Contains(q) || j.Customer.LastName.ToLower().Contains(q))) ||
                (j.Property != null && j.Property.Street != null && j.Property.Street.ToLower().Contains(q)) ||
                (j.Property != null && j.Property.City != null && j.Property.City.ToLower().Contains(q)));
        }

        if (filterDto.TotalMin.HasValue)
        {
            dbQuery = dbQuery.Where(j => j.TotalAmount >= filterDto.TotalMin.Value);
        }

        if (filterDto.TotalMax.HasValue)
        {
            dbQuery = dbQuery.Where(j => j.TotalAmount <= filterDto.TotalMax.Value);
        }

        dbQuery = filterDto.SortBy?.ToLower() switch
        {
            "customer" => filterDto.Sort == "desc"
                ? dbQuery.OrderByDescending(j => j.Customer == null ? "" : j.Customer.FirstName)
                : dbQuery.OrderBy(j => j.Customer == null ? "" : j.Customer.FirstName),

            "total" => filterDto.Sort == "desc"
                ? dbQuery.OrderByDescending(j => j.TotalAmount)
                : dbQuery.OrderBy(j => j.TotalAmount),

            "schedule" => filterDto.Sort == "desc"
                ? dbQuery.OrderByDescending(j => j.StartDateTime)
                : dbQuery.OrderBy(j => j.StartDateTime),

            _ => dbQuery.OrderByDescending(j => j.StartDateTime)
        };

        var totalCount = await dbQuery.CountAsync();
        var pagedJobs = await dbQuery
            .Include(j => j.Customer)
            .Include(j => j.Property)
            .Include(j => j.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new ApiResponse<PagedResult<Job>>
        {
            Success = true,
            Payload = new PagedResult<Job>
            {
                Items = pagedJobs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }



    public async Task<ApiResponse<Job>> CreateJob(CreateJobDto dto)
    {
        if (dto.PropertyId.HasValue)
        {
            var propertyExists = await _context.Properties.AnyAsync(p => p.Id == dto.PropertyId.Value);
            if (!propertyExists)
                return new ApiResponse<Job>
                {
                    Success = false,
                    Payload = null,
                    ErrorMessage = "Property not found."
                };
        }

        List<Employee> employees = [];
        if (dto.AssignedTeamMembers?.Any() == true)
        {
            var employeeIds = dto.AssignedTeamMembers.Select(e => e.Id).ToList();
            employees = await _context.Employees
                .Where(e => e.WorkspaceId == dto.WorkspaceId && employeeIds.Contains(e.Id))
                .ToListAsync();

            var missing = employeeIds.Except(employees.Select(e => e.Id)).ToList();
            if (missing.Count != 0)
                return new ApiResponse<Job>
                {
                    Success = false,
                    Payload = null,
                    ErrorMessage = $"Missing team members: {string.Join(", ", missing)}"
                };
        }

        for (var attempt = 0; attempt < MaxDocumentNumberGenerationAttempts; attempt++)
        {
            var job = dto.Adapt<Job>();
            job.Id = Guid.NewGuid();
            job.JobNumber = await GenerateJobNumber(dto.WorkspaceId);
            job.AssignedTeamMembers = [];
            job.AssignedTeamMembers.AddRange(employees);
            job.LineItems = [];
            if (dto.RecurrenceRule != null)
            {
                job.RecurrenceRule = new RecurrenceRule
                {
                    Id = Guid.NewGuid(), Frequency = dto.RecurrenceRule.Frequency,
                    Interval = Math.Max(1, dto.RecurrenceRule.Interval), DaysOfWeek = dto.RecurrenceRule.DaysOfWeek,
                    EndType = dto.RecurrenceRule.EndType, OccurrenceCount = dto.RecurrenceRule.OccurrenceCount,
                    EndDate = dto.RecurrenceRule.EndDate, DayOfMonth = dto.RecurrenceRule.DayOfMonth,
                    WeekOfMonth = dto.RecurrenceRule.WeekOfMonth, DayOfWeekInMonth = dto.RecurrenceRule.DayOfWeekInMonth,
                    MonthOfYear = dto.RecurrenceRule.MonthOfYear
                };
            }

            if (dto.LineItems?.Any() == true)
            {
                foreach (var lineItemDto in dto.LineItems)
                {
                    var lineItem = new LineItem
                    {
                        Id = Guid.NewGuid(),
                        JobId = job.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Quantity = lineItemDto.Quantity
                    };

                    if (lineItemDto.ServiceItemId.HasValue)
                    {
                        var serviceItem = await _context.ServiceItems.FirstOrDefaultAsync(s => s.Id == lineItemDto.ServiceItemId.Value);
                        if (serviceItem == null)
                            return new ApiResponse<Job>
                            {
                                Success = false,
                                Payload = null,
                                ErrorMessage = $"Service item {lineItemDto.ServiceItemId.Value} not found."
                            };

                        lineItem.ServiceItemId = serviceItem.Id;
                        lineItem.Name = serviceItem.Name;
                        lineItem.Description = serviceItem.Description;
                        lineItem.UnitPrice = serviceItem.UnitPrice;
                        lineItem.Cost = serviceItem.Cost;
                        lineItem.IsTaxable = serviceItem.IsTaxable;
                    }
                    else
                    {
                        lineItem.Name = lineItemDto.Name ?? "Custom Item";
                        lineItem.Description = lineItemDto.Description;
                        lineItem.UnitPrice = lineItemDto.UnitPrice;
                        lineItem.Cost = 0m;
                        lineItem.IsTaxable = false;
                    }

                    job.LineItems.Add(lineItem);
                }
            }

            job.Tags = dto.Tags ?? [];
            job.StatusHistory = dto.StatusHistory ?? [];
            job.RecalculateTotals();

            var customer = await _context.Customers.FindAsync(dto.CustomerId)
                ?? throw new KeyNotFoundException($"Customer with ID {dto.CustomerId} not found.");
            customer.LastActivity = DateTime.UtcNow;

            await _context.Jobs.AddAsync(job);

            try
            {
                await _context.SaveChangesAsync();

                return new ApiResponse<Job>
                {
                    Success = true,
                    Payload = job,
                    ErrorMessage = null
                };
            }
            catch (DbUpdateException)
            {
                _context.ChangeTracker.Clear();

                if (!await _context.Jobs.IgnoreQueryFilters()
                    .AnyAsync(j => j.WorkspaceId == dto.WorkspaceId && j.JobNumber == job.JobNumber))
                {
                    throw;
                }
            }
        }

        return new ApiResponse<Job>
        {
            Success = false,
            Payload = null,
            ErrorMessage = "Could not generate a unique job number. Please try again."
        };
    }


    public async Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null)
    {
        var existingJob = await _context.Jobs
                                        .Include(j => j.LineItems)
                                        .Include(j => j.AssignedTeamMembers)
                                            .ThenInclude(e => e.User)
                                        .FirstOrDefaultAsync(j => j.Id == updatedJobDto.Id);

        if (existingJob == null || existingJob.WorkspaceId != callerWorkspaceId
            || (restrictToEmployeeId != null && !existingJob.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };
        }

        existingJob.Title = updatedJobDto.Title ?? existingJob.Title;
        existingJob.Description = updatedJobDto.Description ?? existingJob.Description;
        existingJob.PropertyId = updatedJobDto.PropertyId ?? existingJob.PropertyId;
        existingJob.JobType = updatedJobDto.JobType ?? existingJob.JobType;
        existingJob.Priority = updatedJobDto.Priority ?? existingJob.Priority;
        existingJob.Status = updatedJobDto.Status ?? existingJob.Status;
        existingJob.ArrivalWindow = updatedJobDto.ArrivalWindow ?? existingJob.ArrivalWindow;
        existingJob.EstimatedDurationMinutes = updatedJobDto.EstimatedDurationMinutes ?? existingJob.EstimatedDurationMinutes;
        existingJob.DepositAmount = updatedJobDto.DepositAmount ?? existingJob.DepositAmount;
        existingJob.PaymentStatus = updatedJobDto.PaymentStatus ?? existingJob.PaymentStatus;
        existingJob.DiscountType = updatedJobDto.DiscountType ?? existingJob.DiscountType;
        existingJob.DiscountValue = updatedJobDto.DiscountValue ?? existingJob.DiscountValue;
        existingJob.TaxRate = updatedJobDto.TaxRate ?? existingJob.TaxRate;
        existingJob.SendInvoice = updatedJobDto.SendInvoice ?? existingJob.SendInvoice;
        existingJob.SendReminder = updatedJobDto.SendReminder ?? existingJob.SendReminder;
        existingJob.ReminderDaysBefore = updatedJobDto.ReminderDaysBefore ?? existingJob.ReminderDaysBefore;
        existingJob.ConfirmationSent = updatedJobDto.ConfirmationSent ?? existingJob.ConfirmationSent;
        existingJob.ReminderSent = updatedJobDto.ReminderSent ?? existingJob.ReminderSent;
        existingJob.InvoiceSent = updatedJobDto.InvoiceSent ?? existingJob.InvoiceSent;
        existingJob.Source = updatedJobDto.Source ?? existingJob.Source;
        existingJob.CustomerNotes = updatedJobDto.CustomerNotes ?? existingJob.CustomerNotes;
        existingJob.InternalNotes = updatedJobDto.InternalNotes ?? existingJob.InternalNotes;
        existingJob.Tags = updatedJobDto.Tags ?? existingJob.Tags;

        if (updatedJobDto.StartDateTime != default) existingJob.StartDateTime = updatedJobDto.StartDateTime;
        if (updatedJobDto.EndDateTime != default) existingJob.EndDateTime = updatedJobDto.EndDateTime;

        if (updatedJobDto.AssignedTeamMembers != null)
        {
            var incomingIds = updatedJobDto.AssignedTeamMembers.Select(e => e.Id).ToHashSet();
            var existingIds = existingJob.AssignedTeamMembers.Select(e => e.Id).ToHashSet();

            var idsToAdd = incomingIds.Except(existingIds).ToList();
            var idsToRemove = existingIds.Except(incomingIds).ToList();

            if (idsToAdd.Any())
            {
                var employeesToAdd = await _context.Employees
                    .Where(e => e.WorkspaceId == callerWorkspaceId && idsToAdd.Contains(e.Id))
                    .ToListAsync();
                foreach (var e in employeesToAdd)
                {
                    existingJob.AssignedTeamMembers.Add(e);
                }
            }

            var employeesToRemove = existingJob.AssignedTeamMembers.Where(e => idsToRemove.Contains(e.Id)).ToList();
            foreach (var e in employeesToRemove)
            {
                existingJob.AssignedTeamMembers.Remove(e);
            }
        }

        if (updatedJobDto.LineItems != null)
        {
            var dtoItems = updatedJobDto.LineItems;

            var itemsToRemove = existingJob.LineItems
                .Where(existing => !dtoItems.Any(dto => dto.Id.HasValue && dto.Id == existing.Id))
                .ToList();
            _context.LineItems.RemoveRange(itemsToRemove);

            foreach (var dto in dtoItems)
            {
                LineItem lineItem;
                bool isNew = !dto.Id.HasValue || dto.Id == Guid.Empty;

                if (!isNew)
                {
                    lineItem = existingJob.LineItems.FirstOrDefault(i => i.Id == dto.Id!.Value)!;
                    if (lineItem == null) continue;
                }
                else
                {
                    lineItem = new LineItem
                    {
                        Id = Guid.NewGuid(),
                        JobId = existingJob.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    existingJob.LineItems.Add(lineItem);
                }

                lineItem.UpdatedAt = DateTime.UtcNow;

                if (dto.ServiceItemId.HasValue && dto.ServiceItemId != Guid.Empty)
                {
                    var serviceItem = await _context.ServiceItems.AsNoTracking()
                                                                .FirstOrDefaultAsync(si => si.Id == dto.ServiceItemId.Value)
                                                                ?? throw new Exception($"ServiceItem with ID {dto.ServiceItemId.Value} not found.");
                    lineItem.ServiceItemId = serviceItem.Id;
                    lineItem.Name = serviceItem.Name;
                    lineItem.Description = serviceItem.Description;
                    lineItem.UnitPrice = serviceItem.UnitPrice;
                    lineItem.Cost = serviceItem.Cost;
                    lineItem.IsTaxable = serviceItem.IsTaxable;
                }
                else
                {
                    lineItem.ServiceItemId = null;
                    lineItem.Name = dto.Name ?? lineItem.Name;
                    lineItem.Description = dto.Description ?? lineItem.Description;
                    lineItem.UnitPrice = dto.UnitPrice ?? lineItem.UnitPrice;
                    lineItem.Cost = 0m;
                    lineItem.IsTaxable = false;
                }

                lineItem.Quantity = dto.Quantity ?? lineItem.Quantity;
            }
        }

        existingJob.RecalculateTotals();
        existingJob.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new ApiResponse<Job> { Success = true, Payload = existingJob };
    }


    public async Task DeleteJob(Guid id, Guid callerWorkspaceId)
    {
        var job = await _context.Jobs.FindAsync(id) ?? throw new Exception("Job not found");
        if (job.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That job is not in your workspace.");
        }
        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<Job>> UpdateJobTags(Guid jobId, List<string> tags, bool replace, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null)
    {
        var job = await _context.Jobs.Include(j => j.AssignedTeamMembers).FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null || job.WorkspaceId != callerWorkspaceId
            || (restrictToEmployeeId != null && !job.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };

        if (replace)
        {
            job.Tags = tags;
        }
        else
        {
            var updatedTags = new HashSet<string>(job.Tags ?? []);
            foreach (var tag in tags)
                updatedTags.Add(tag);

            job.Tags = updatedTags.ToList();
        }

        job.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new ApiResponse<Job> { Success = true, Payload = job };
    }

    public async Task<ApiResponse<Job>> RecordDepositPayment(Guid jobId, RecordJobDepositPaymentDto paymentDto, Guid callerWorkspaceId, Guid recordedByUserId, Guid? restrictToEmployeeId = null)
    {
        var job = await _context.Jobs
            .Include(j => j.Payments)
            .Include(j => j.AssignedTeamMembers)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null || job.WorkspaceId != callerWorkspaceId
            || (restrictToEmployeeId != null && !job.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };
        }

        if (job.DepositAmount <= 0m)
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "This job doesn't have a deposit amount set." };
        }

        if (job.DepositBalanceDue <= 0m)
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "The deposit has already been paid in full." };
        }

        if (paymentDto.Amount > job.DepositBalanceDue)
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Payment amount cannot exceed the remaining deposit balance." };
        }

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            JobId = job.Id,
            Amount = paymentDto.Amount,
            Method = paymentDto.Method,
            Status = PaymentRecordStatus.Succeeded,
            PaidAt = DateTime.SpecifyKind(paymentDto.PaidAt, DateTimeKind.Utc),
            RecordedByUserId = recordedByUserId,
            Note = string.IsNullOrWhiteSpace(paymentDto.Note) ? null : paymentDto.Note.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Computed from job.DepositPaid + this payment's amount rather than the
        // post-save value, since job.Payments' in-memory fixup timing for a
        // just-added, not-yet-saved entity isn't something to rely on here.
        var updatedDepositPaid = job.DepositPaid + paymentDto.Amount;
        job.PaymentStatus = updatedDepositPaid switch
        {
            <= 0m => PaymentStatus.Unpaid,
            _ when job.TotalAmount > 0m && updatedDepositPaid >= job.TotalAmount => PaymentStatus.Paid,
            _ => PaymentStatus.Partial
        };
        job.UpdatedAt = DateTime.UtcNow;

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return new ApiResponse<Job> { Success = true, Payload = job };
    }

    public async Task<ApiResponse<Job>> ChangeJobStatus(Guid jobId, JobStatus status, Guid callerWorkspaceId, Guid userId, Guid? restrictToEmployeeId = null)
    {
        var job = await _context.Jobs
            .Include(j => j.LineItems)
            .Include(j => j.AssignedTeamMembers)
            .Include(j => j.StatusHistory)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null || job.WorkspaceId != callerWorkspaceId
            || (restrictToEmployeeId != null && !job.AssignedTeamMembers.Any(e => e.Id == restrictToEmployeeId)))
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };
        }

        if (job.Status == status)
        {
            return new ApiResponse<Job> { Success = true, Payload = job };
        }

        var previousStatus = job.Status;
        job.Status = status;
        job.UpdatedAt = DateTime.UtcNow;
        _context.StatusChanges.Add(new StatusChange
        {
            Id = Guid.NewGuid(),
            JobId = job.Id,
            FromStatus = previousStatus.ToString(),
            ToStatus = status.ToString(),
            ChangedAt = DateTime.UtcNow,
            ChangedBy = userId
        });

        var justCompleted = status == JobStatus.Completed && previousStatus != JobStatus.Completed;
        if (justCompleted)
        {
            job.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        if (justCompleted && job.SendInvoice && !job.InvoiceSent)
        {
            await GenerateAndSendCompletionInvoiceAsync(job, callerWorkspaceId, userId);
        }

        return new ApiResponse<Job> { Success = true, Payload = job };
    }

    // Best-effort: a job's completion shouldn't fail (or roll back the status
    // change already saved above) just because invoicing hit a snag - the
    // InvoiceSent flag is only set once CreateInvoice succeeds, so a failure
    // here leaves the job eligible to be invoiced again by hand.
    private async Task GenerateAndSendCompletionInvoiceAsync(Job job, Guid callerWorkspaceId, Guid userId)
    {
        if (job.LineItems.Count == 0)
        {
            return;
        }

        var customer = await _context.Customers
            .Include(c => c.Properties)
            .FirstOrDefaultAsync(c => c.Id == job.CustomerId);
        if (customer == null)
        {
            return;
        }

        var propertyId = job.PropertyId ?? customer.Properties?.FirstOrDefault()?.Id;
        if (propertyId is not Guid resolvedPropertyId)
        {
            return;
        }

        Invoice invoice;
        try
        {
            invoice = await _invoiceService.CreateInvoice(new CreateInvoiceDto
            {
                CustomerId = job.CustomerId,
                WorkspaceId = callerWorkspaceId,
                PropertyId = resolvedPropertyId,
                JobId = job.Id,
                Title = job.Title,
                TaxRate = job.TaxRate,
                Discount = job.DiscountValue,
                DiscountType = job.DiscountType,
                IssueDate = DateTime.UtcNow,
                PaymentTerms = "uponReceipt",
                LineItems = job.LineItems.Select(li => new CreateLineItemDto
                {
                    ServiceItemId = li.ServiceItemId,
                    Name = li.Name,
                    Description = li.Description,
                    UnitPrice = li.UnitPrice,
                    Cost = li.Cost,
                    Quantity = li.Quantity,
                    IsTaxable = li.IsTaxable,
                    IsOptional = li.IsOptional
                }).ToList()
            });
        }
        catch (Exception)
        {
            return;
        }

        job.InvoiceSent = true;
        await _context.SaveChangesAsync();

        if (!customer.IsReceiveInvoiceNotifications || customer.Emails.Count == 0)
        {
            return;
        }

        try
        {
            await _invoiceService.SendInvoice(
                invoice.Id,
                new SendInvoiceDto
                {
                    Recipients = customer.Emails,
                    Subject = $"Invoice {invoice.InvoiceNumber} for {job.Title}",
                    Message = "Thanks for choosing us! Your job is complete - please find the invoice attached.",
                    AttachPdf = true
                },
                callerWorkspaceId,
                userId,
                "System");
        }
        catch (Exception)
        {
            // The invoice already exists and can still be sent manually.
        }
    }

    private async Task<string> GenerateJobNumber(Guid workspaceId)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = "JOB-";
        var datePart = today.ToString("yyMMdd");

        var lastJob = await _context.Jobs.Where(j => j.JobNumber.StartsWith(prefix + datePart) && j.WorkspaceId == workspaceId)
                                        .OrderByDescending(j => j.JobNumber)
                                        .Select(j => j.JobNumber)
                                        .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastJob != null)
        {
            var parts = lastJob.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastSequence))
            {
                sequence = lastSequence + 1;
            }
        }

        return $"{prefix}{datePart}-{sequence:D4}";
    }

    public async Task<JobStatsDto> GetJobStats(Guid workspaceId)
    {
        var stats = await _context.Jobs
            .Where(j => j.WorkspaceId == workspaceId)
            .GroupBy(_ => 1)
            .Select(group => new JobStatsDto
            {
                TotalJobs = group.Count(),
                CompletedJobs = group.Count(j => j.Status == JobStatus.Completed),
                ScheduledJobs = group.Count(j => j.Status == JobStatus.Scheduled),
                TotalValue = group.Sum(j => j.TotalAmount)
            })
            .FirstOrDefaultAsync();

        return stats ?? new JobStatsDto
        {
            TotalJobs = 0,
            CompletedJobs = 0,
            ScheduledJobs = 0,
            TotalValue = 0m
        };
    }

    public async Task<JobProfitabilityDto> GetJobProfitability(Guid workspaceId)
    {
        var jobs = await _context.Jobs.AsNoTracking().Where(j => j.WorkspaceId == workspaceId)
            .Include(j => j.LineItems).Include(j => j.AssignedTeamMembers).ThenInclude(e => e.User).ToListAsync();
        static decimal Revenue(Job j) => j.LineItems.Sum(i => i.UnitPrice * i.Quantity);
        static decimal Cost(Job j) => j.LineItems.Sum(i => i.Cost * i.Quantity);
        static decimal Margin(decimal revenue, decimal cost) => revenue == 0 ? 0 : Math.Round((revenue - cost) / revenue * 100, 2);
        static ProfitabilityRowDto Row(string id, string name, decimal revenue, decimal cost) => new() { Id = id, Name = name, Revenue = revenue, Cost = cost, GrossProfit = revenue - cost, MarginPercent = Margin(revenue, cost) };
        var result = new JobProfitabilityDto { Revenue = jobs.Sum(Revenue), Cost = jobs.Sum(Cost) };
        result.GrossProfit = result.Revenue - result.Cost;
        result.MarginPercent = Margin(result.Revenue, result.Cost);
        result.ByJob = jobs.Select(j => Row(j.Id.ToString(), j.Title, Revenue(j), Cost(j))).OrderByDescending(r => r.GrossProfit).ToList();
        result.ByServiceItem = jobs.SelectMany(j => j.LineItems).GroupBy(i => i.ServiceItemId?.ToString() ?? $"custom:{i.Name}").Select(g => Row(g.Key, g.First().Name, g.Sum(i => i.UnitPrice * i.Quantity), g.Sum(i => i.Cost * i.Quantity))).OrderByDescending(r => r.GrossProfit).ToList();
        result.ByTechnician = jobs.SelectMany(j => j.AssignedTeamMembers.Select(e => new { Employee = e, Job = j })).GroupBy(x => x.Employee.Id).Select(g => Row(g.Key.ToString(), g.First().Employee.User?.FullName ?? "Technician", g.Sum(x => Revenue(x.Job)), g.Sum(x => Cost(x.Job)))).OrderByDescending(r => r.GrossProfit).ToList();
        return result;
    }


}
