using backend.Data;
using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.JobService;

public class JobService : IJobService
{
    private readonly DataContext _context;
    public JobService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Job>>> GetJobs()
    {
        var jobs = await _context.Jobs.Include(j => j.Customer)
                                    .Include(j => j.Property)
                                    .Include(j => j.AssignedTeamMembers)
                                    .Include(j => j.LineItems)
                                        .ThenInclude(li => li.ServiceItem)
                                    .ToListAsync();

        return new ApiResponse<List<Job>>()
        {
            Success = true,
            Payload = jobs,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Job>> GetJobById(Guid jobId)
    {
        var job = await _context.Jobs.Where(j => j.Id == jobId)
                                    .Include(j => j.LineItems)
                                        .ThenInclude(l => l.ServiceItem)
                                    .Include(j => j.Customer)
                                        .ThenInclude(c => c.CustomerPhones)
                                    .Include(j => j.Customer)
                                        .ThenInclude(c => c.Properties)
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

    public async Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId)
    {
        var jobs = await _context.Jobs.Where(j => j.CustomerId == customerId)
                                    .Include(j => j.LineItems)
                                        .ThenInclude(li => li.ServiceItem)
                                    .Include(j => j.Property)
                                    .ToListAsync();

        return new ApiResponse<List<Job>> { Success = true, Payload = jobs };
    }

    public async Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId)
    {
        var filteredJobs = await _context.Jobs.Include(j => j.AssignedTeamMembers)
                                            .Where(j => j.AssignedTeamMembers.Any(e => e.Id == employeeId))
                                            .Include(j => j.LineItems)
                                            .Include(j => j.Property)
                                            .Include(j => j.Customer)
                                            .ToListAsync();

        return new ApiResponse<List<Job>> { Success = true, Payload = filteredJobs };
    }

    public async Task<Job> GetJobByJobNumber(string jobNumber)
    {
        var job = await _context.Jobs.Where(j => j.JobNumber == jobNumber)
                            .Include(j => j.LineItems)
                                .ThenInclude(l => l.ServiceItem)
                            .Include(j => j.Customer)
                                .ThenInclude(c => c.CustomerPhones)
                            .Include(j => j.Customer)
                                .ThenInclude(c => c.Properties)
                            .FirstOrDefaultAsync();

        return job ?? throw new Exception("Job not found");

    }

    public async Task<ApiResponse<PagedResult<Job>>> GetJobsByWorkspace(Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.Jobs
            .Where(j => j.WorkspaceId == workspaceId)
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
    int pageSize)
    {
        var dbQuery = _context.Jobs
            .Where(j => j.WorkspaceId == workspaceId)
            .Include(j => j.Customer)
            .Include(j => j.Property)
            .Include(j => j.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .AsNoTracking()
            .AsQueryable();

        if (filterDto.ScheduleDateMin.HasValue)
        {
            var minUtc = DateTime.SpecifyKind(filterDto.ScheduleDateMin.Value, DateTimeKind.Utc);
            dbQuery = dbQuery.Where(j => j.StartDateTime >= minUtc);
        }

        if (filterDto.ScheduleDateMax.HasValue)
        {
            var endOfDay = filterDto.ScheduleDateMax.Value.Date.AddDays(1).AddTicks(-1);
            var maxUtc = DateTime.SpecifyKind(endOfDay, DateTimeKind.Utc);
            dbQuery = dbQuery.Where(j => j.StartDateTime <= maxUtc);
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
            var q = filterDto.Q.ToLower();
            dbQuery = dbQuery.Where(j =>
                j.JobNumber.ToLower().Contains(q) ||
                j.Customer.FirstName.ToLower().Contains(q) ||
                j.Customer.LastName.ToLower().Contains(q) ||
                j.Property.Street.ToLower().Contains(q) ||
                j.Property.City.ToLower().Contains(q));
        }

        var jobsList = await dbQuery.ToListAsync();

        if (filterDto.TotalMin.HasValue)
        {
            jobsList = jobsList
                .Where(j => j.TotalAmount >= filterDto.TotalMin.Value)
                .ToList();
        }

        if (filterDto.TotalMax.HasValue)
        {
            jobsList = jobsList
                .Where(j => j.TotalAmount <= filterDto.TotalMax.Value)
                .ToList();
        }

        jobsList = filterDto.SortBy?.ToLower() switch
        {
            "customer" => filterDto.Sort == "desc"
                ? jobsList.OrderByDescending(j => j.Customer?.FirstName).ToList()
                : jobsList.OrderBy(j => j.Customer?.FirstName).ToList(),

            "total" => filterDto.Sort == "desc"
                ? jobsList.OrderByDescending(j => j.TotalAmount).ToList()
                : jobsList.OrderBy(j => j.TotalAmount).ToList(),

            "schedule" => filterDto.Sort == "desc"
                ? jobsList.OrderByDescending(j => j.StartDateTime).ToList()
                : jobsList.OrderBy(j => j.StartDateTime).ToList(),

            _ => jobsList.OrderByDescending(j => j.StartDateTime).ToList()
        };

        var totalCount = jobsList.Count;
        var pagedJobs = jobsList
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

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
        var job = dto.Adapt<Job>();
        job.Id = Guid.NewGuid();
        job.JobNumber = await GenerateJobNumber(dto.WorkspaceId);

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

        job.AssignedTeamMembers = [];
        if (dto.AssignedTeamMembers?.Any() == true)
        {
            var employeeIds = dto.AssignedTeamMembers.Select(e => e.Id).ToList();
            var employees = _context.Employees
                .AsEnumerable()
                .Where(e => employeeIds.Contains(e.Id))
                .ToList();

            var missing = employeeIds.Except(employees.Select(e => e.Id)).ToList();
            if (missing.Count != 0)
                return new ApiResponse<Job>
                {
                    Success = false,
                    Payload = null,
                    ErrorMessage = $"Missing team members: {string.Join(", ", missing)}"
                };
            job.AssignedTeamMembers.AddRange(employees);
        }

        job.LineItems = [];
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

        var customer = await _context.Customers.FindAsync(dto.CustomerId);
        customer.LastActivity = DateTime.UtcNow;

        await _context.Jobs.AddAsync(job);
        await _context.SaveChangesAsync();


        return new ApiResponse<Job>
        {
            Success = true,
            Payload = job,
            ErrorMessage = null
        };
    }


    public async Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto)
    {
        var existingJob = await _context.Jobs
                                        .Include(j => j.LineItems)
                                        .Include(j => j.AssignedTeamMembers)
                                            .ThenInclude(e => e.User)
                                        .FirstOrDefaultAsync(j => j.Id == updatedJobDto.Id);

        if (existingJob == null)
        {
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };
        }

        existingJob.Title = updatedJobDto.Title ?? existingJob.Title;
        existingJob.Description = updatedJobDto.Description ?? existingJob.Description;
        existingJob.PropertyId = updatedJobDto.PropertyId ?? existingJob.PropertyId;
        existingJob.JobType = updatedJobDto.JobType ?? existingJob.JobType;
        existingJob.Priority = updatedJobDto.Priority ?? existingJob.Priority;
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

        //Date can't be null check later if there is problem with dates
        // if (updatedJobDto.StartDateTime != null) existingJob.StartDateTime = updatedJobDto.StartDateTime;
        // if (updatedJobDto.EndDateTime != null) existingJob.EndDateTime = updatedJobDto.EndDateTime;

        if (updatedJobDto.AssignedTeamMembers != null)
        {
            var incomingIds = updatedJobDto.AssignedTeamMembers.Select(e => e.Id).ToHashSet();
            var existingIds = existingJob.AssignedTeamMembers.Select(e => e.Id).ToHashSet();

            var idsToAdd = incomingIds.Except(existingIds).ToList();
            var idsToRemove = existingIds.Except(incomingIds).ToList();

            if (idsToAdd.Any())
            {
                var employeesToAdd = _context.Employees.AsEnumerable().Where(e => idsToAdd.Contains(e.Id)).ToList();
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
                    lineItem = existingJob.LineItems.FirstOrDefault(i => i.Id == dto.Id.Value);
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

        existingJob.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new ApiResponse<Job> { Success = true, Payload = existingJob };
    }


    public async Task DeleteJob(Guid id)
    {
        var job = await _context.Jobs.FindAsync(id) ?? throw new Exception("Job not found");
        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<Job>> UpdateJobTags(Guid jobId, List<string> tags, bool replace)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null)
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
        var jobs = await _context.Jobs
            .Where(j => j.WorkspaceId == workspaceId)
            .Include(j => j.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .ToListAsync();

        int totalJobs = jobs.Count;
        int completedJobs = jobs.Count(j => j.Status == JobStatus.Completed);
        int scheduledJobs = jobs.Count(j => j.Status == JobStatus.Scheduled || j.StartDateTime > DateTime.UtcNow);

        decimal totalValue = 0;

        foreach (var job in jobs)
        {
            decimal jobTotal = job.LineItems.Sum(li =>
                (li.ServiceItem?.UnitPrice ?? li.UnitPrice) * li.Quantity
            );
            totalValue += jobTotal;
        }

        return new JobStatsDto
        {
            TotalJobs = totalJobs,
            CompletedJobs = completedJobs,
            ScheduledJobs = scheduledJobs,
            TotalValue = totalValue
        };
    }


}