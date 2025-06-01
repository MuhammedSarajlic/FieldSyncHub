using backend.Data;
using backend.Models;
using backend.Response;
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
        var job = await _context.Jobs.Where(j => j.JobId == jobId)
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

    public async Task CreateJob(Job newJob)
    {
        // Generate JobId if it's empty
        if (newJob.JobId == Guid.Empty)
        {
            newJob.JobId = Guid.NewGuid();
        }

        // Set CreatedAt and UpdatedAt timestamps
        newJob.CreatedAt = DateTime.UtcNow;
        newJob.UpdatedAt = DateTime.UtcNow;

        // Validate Customer
        var customerExists = await _context.Customers.AnyAsync(c => c.CustomerId == newJob.CustomerId);
        if (!customerExists)
        {
            throw new Exception("Customer not found");
        }

        // Validate Property
        if (newJob.PropertyId.HasValue)
        {
            var propertyExists = await _context.Properties.AnyAsync(p => p.Id == newJob.PropertyId.Value);
            if (!propertyExists)
            {
                throw new Exception("Property not found");
            }
        }

        // Handle LineItems
        foreach (var item in newJob.LineItems)
        {
            // Validate ServiceItem exists
            var serviceItemExists = await _context.ServiceItems.AnyAsync(s => s.ServiceItemId == item.ServiceItemId);
            if (!serviceItemExists)
            {
                throw new Exception($"ServiceItem with ID {item.ServiceItemId} not found");
            }

            // Generate LineItemId if missing
            if (item.LineItemId == Guid.Empty)
            {
                item.LineItemId = Guid.NewGuid();
            }

            // Link LineItem to the Job
            item.JobId = newJob.JobId;
        }

        // Add job + line items in one go
        await _context.Jobs.AddAsync(newJob);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteJob(Guid id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            throw new Exception("Job not found");

        _context.Remove(job);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<Job>> UpdateJob(Job updatedJob)
    {
        var existingJob = await _context.Jobs
        .Include(j => j.LineItems)
        .FirstOrDefaultAsync(j => j.JobId == updatedJob.JobId);

        if (existingJob == null)
            return new ApiResponse<Job> { Success = false, ErrorMessage = "Job not found" };

        _context.Entry(existingJob).CurrentValues.SetValues(updatedJob);

        existingJob.LineItems.Clear();
        foreach (var item in updatedJob.LineItems)
        {
            item.LineItemId = item.LineItemId == Guid.Empty ? Guid.NewGuid() : item.LineItemId;
            item.JobId = updatedJob.JobId;
            existingJob.LineItems.Add(item);
        }

        existingJob.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse<Job> { Success = true, Payload = existingJob };
    }

    public async Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId)
    {
        var jobs = await _context.Jobs
    .Where(j => j.CustomerId == customerId)
    .Include(j => j.LineItems)
    .Include(j => j.Property)
    .ToListAsync();

        return new ApiResponse<List<Job>> { Success = true, Payload = jobs };
    }
    public async Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId)
    {
        var jobs = await _context.Jobs
            .Include(j => j.LineItems)
            .Include(j => j.Property)
            .Include(j => j.Customer)
            .ToListAsync(); 

        var filteredJobs = jobs
            .Where(j => j.AssignedTeamMemberIds != null && j.AssignedTeamMemberIds.Contains(employeeId))
            .ToList(); 

        return new ApiResponse<List<Job>> { Success = true, Payload = filteredJobs };
    }
    public async Task<ApiResponse<List<Job>>> GetJobsByFilter(DateTime? scheduleDateMin, DateTime? scheduleDateMax, decimal? totalMin, decimal? totalMax, string? priority, string? status, string? sortBy, string? sort)
    {
        var query = _context.Jobs
        .Include(j => j.Customer)
        .Include(j => j.Property)
        .Include(j => j.LineItems)
        .AsQueryable();

        if (scheduleDateMin.HasValue)
            query = query.Where(j => j.StartDate >= scheduleDateMin.Value);

        if (scheduleDateMax.HasValue)
            query = query.Where(j => j.StartDate <= scheduleDateMax.Value);

        if (totalMin.HasValue)
            query = query.Where(j => j.TotalAmount >= totalMin.Value);

        if (totalMax.HasValue)
            query = query.Where(j => j.TotalAmount <= totalMax.Value);

        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(j => j.Priority.ToLower() == priority.ToLower());

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(j => j.Status.ToLower() == status.ToLower());

        query = sortBy?.ToLower() switch
        {
            "customer" => sort == "desc"
                ? query.OrderByDescending(j => j.Customer.FirstName)
                : query.OrderBy(j => j.Customer.FirstName),

            "total" => sort == "desc"
                ? query.OrderByDescending(j => j.TotalAmount)
                : query.OrderBy(j => j.TotalAmount),

            "schedule" => sort == "desc"
                ? query.OrderByDescending(j => j.StartDate)
                : query.OrderBy(j => j.StartDate),

            _ => query.OrderByDescending(j => j.StartDate)
        };

        var result = await query.ToListAsync();

        return new ApiResponse<List<Job>> { Success = true, Payload = result };
    }
}