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
}