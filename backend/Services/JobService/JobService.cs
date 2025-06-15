using backend.Data;
using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
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

    public async Task<ApiResponse<List<Job>>> GetJobsByFilter(JobFilterDto filterDto, Guid workspaceId)
    {
        var query = _context.Jobs.Where(j => j.WorkspaceId == workspaceId)
                                .Include(j => j.Customer)
                                .Include(j => j.Property)
                                .Include(j => j.LineItems)
                                    .ThenInclude(li => li.ServiceItem)
                                .AsNoTracking()
                                .AsQueryable();

        // 🔍 Date range
        if (filterDto.ScheduleDateMin.HasValue)
            query = query.Where(j => j.StartDate >= filterDto.ScheduleDateMin.Value);

        if (filterDto.ScheduleDateMax.HasValue)
            query = query.Where(j => j.StartDate <= filterDto.ScheduleDateMax.Value);

        // 🔍 Total range
        if (filterDto.TotalMin.HasValue)
            query = query.Where(j => j.TotalAmount >= filterDto.TotalMin.Value);

        if (filterDto.TotalMax.HasValue)
            query = query.Where(j => j.TotalAmount <= filterDto.TotalMax.Value);

        // 🔍 Priority
        if (!string.IsNullOrWhiteSpace(filterDto.Priority))
            query = query.Where(j => j.Priority.ToString().ToLower() == filterDto.Priority.ToLower());

        // 🔍 Status
        if (!string.IsNullOrWhiteSpace(filterDto.Status))
            query = query.Where(j => j.Status.ToString().ToLower() == filterDto.Status.ToLower());

        // 🔍 Search (job number, customer name, property address)
        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            var q = filterDto.Q.ToLower();
            query = query.Where(j =>
                j.JobNumber.ToLower().Contains(q) ||
                (j.Customer != null && (
                    j.Customer.FirstName.ToLower().Contains(q) ||
                    j.Customer.LastName.ToLower().Contains(q) ||
                    j.Customer.FullName.ToLower().Contains(q)
                )) ||
                (j.Property != null && (
                    j.Property.Street.ToLower().Contains(q) ||
                    j.Property.City.ToLower().Contains(q)
                ))
            );
        }

        // 🔄 Sorting
        var sortBy = filterDto.SortBy?.ToLower();
        var sort = filterDto.Sort?.ToLower();

        query = sortBy switch
        {
            "customer" => sort == "desc"
                ? query.OrderByDescending(j => j.Customer.FullName)
                : query.OrderBy(j => j.Customer.FullName),

            "total" => sort == "desc"
                ? query.OrderByDescending(j => j.TotalAmount)
                : query.OrderBy(j => j.TotalAmount),

            "schedule" => sort == "desc"
                ? query.OrderByDescending(j => j.StartDate)
                : query.OrderBy(j => j.StartDate),

            _ => query.OrderByDescending(j => j.StartDate)
        };

        var result = await query.ToListAsync();

        return new ApiResponse<List<Job>>
        {
            Success = true,
            Payload = result
        };
    }

    public async Task<Job> CreateJob(CreateJobDto createJobDto)
    {
        var job = createJobDto.Adapt<Job>();
        job.Id = Guid.NewGuid();

        job.CreatedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;
        job.JobNumber = await GenerateJobNumber(createJobDto.WorkspaceId);

        if (job.PropertyId.HasValue)
        {
            var propertyExists = await _context.Properties.AnyAsync(p => p.Id == job.PropertyId.Value);
            if (!propertyExists)
            {
                throw new Exception("Property not found");
            }
        }

        foreach (var item in job.LineItems)
        {
            // Validate ServiceItem exists
            var serviceItemExists = await _context.ServiceItems.AnyAsync(s => s.Id == item.ServiceItemId);
            if (!serviceItemExists)
            {
                throw new Exception($"ServiceItem with ID {item.ServiceItemId} not found");
            }

            if (item.Id == Guid.Empty)
            {
                item.Id = Guid.NewGuid();
            }

            item.JobId = job.Id;
        }

        await _context.Jobs.AddAsync(job);
        await _context.SaveChangesAsync();

        return job;
    }

    public async Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto)
    {
        var existingJob = await _context.Jobs.Include(j => j.LineItems)
                                            .FirstOrDefaultAsync(j => j.Id == updatedJobDto.Id);

        if (existingJob == null)
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };

        _context.Entry(existingJob).CurrentValues.SetValues(updatedJobDto);

        existingJob.AssignedTeamMembers = updatedJobDto.AssignedTeamMembers;

        // 🔁 Update internal notes if needed
        if (updatedJobDto.InternalNotes != null)
        {
            existingJob.InternalNotes = updatedJobDto.InternalNotes;
        }

        // 🔁 Replace line items
        _context.LineItems.RemoveRange(existingJob.LineItems);
        foreach (var item in updatedJobDto.LineItems)
        {
            existingJob.LineItems.Add(new LineItem
            {
                Id = (Guid)(item.Id != Guid.Empty ? item.Id : Guid.NewGuid()),
                ServiceItemId = item.ServiceItemId,
                Name = item.Name ?? string.Empty,
                Description = item.Description,
                UnitPrice = item.UnitPrice ?? 0,
                Quantity = item.Quantity ?? 1,
                JobId = existingJob.Id
            });
        }

        existingJob.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse<Job> { Success = true, Payload = existingJob };
    }

    public async Task DeleteJob(Guid id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            throw new Exception("Job not found");

        _context.Remove(job);
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

        return $"{prefix}{datePart}-{sequence:D3}";
    }

}