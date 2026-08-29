using backend.Data;
using backend.Dtos.JobDto;
using backend.Models;
using backend.Services.JobService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

/// <summary>
/// A caller with role Employee could previously fetch, list, or edit any job in the
/// workspace - including pricing and customer details for jobs they had nothing to do
/// with. JobService's read/update methods now take an optional restrictToEmployeeId
/// that, when set, limits results to jobs that employee is actually assigned to.
/// These pin that restriction directly against the service (JobController resolves
/// the id server-side from the caller's own token before passing it in).
/// </summary>
public class JobEmployeeScopingTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static async Task<(DataContext context, Guid workspaceId, Guid assignedEmployeeId, Guid otherEmployeeId, Job assignedJob, Job unassignedJob)> Seed()
    {
        var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };

        var assignedEmployeeUser = new User { Id = Guid.NewGuid(), Email = "assigned@acme.test", FirstName = "A", LastName = "E" };
        var otherEmployeeUser = new User { Id = Guid.NewGuid(), Email = "other@acme.test", FirstName = "O", LastName = "E" };
        var assignedEmployee = new Employee { Id = Guid.NewGuid(), WorkspaceId = workspaceId, UserId = assignedEmployeeUser.Id };
        var otherEmployee = new Employee { Id = Guid.NewGuid(), WorkspaceId = workspaceId, UserId = otherEmployeeUser.Id };

        var assignedJob = new Job
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            Title = "Assigned job",
            CustomerId = customer.Id,
            AssignedTeamMembers = [assignedEmployee]
        };
        var unassignedJob = new Job
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            Title = "Someone else's job",
            CustomerId = customer.Id,
            AssignedTeamMembers = [otherEmployee]
        };

        context.Customers.Add(customer);
        context.Users.AddRange(assignedEmployeeUser, otherEmployeeUser);
        context.Employees.AddRange(assignedEmployee, otherEmployee);
        context.Jobs.AddRange(assignedJob, unassignedJob);
        await context.SaveChangesAsync();

        return (context, workspaceId, assignedEmployee.Id, otherEmployee.Id, assignedJob, unassignedJob);
    }

    [Fact]
    public async Task GetJobById_returns_the_job_when_the_employee_is_assigned()
    {
        var (context, workspaceId, assignedEmployeeId, _, assignedJob, _) = await Seed();
        var service = new JobService(context);

        var result = await service.GetJobById(assignedJob.Id, workspaceId, assignedEmployeeId);

        Assert.NotNull(result.Payload);
    }

    [Fact]
    public async Task GetJobById_hides_a_job_the_employee_is_not_assigned_to()
    {
        var (context, workspaceId, assignedEmployeeId, _, _, unassignedJob) = await Seed();
        var service = new JobService(context);

        var result = await service.GetJobById(unassignedJob.Id, workspaceId, assignedEmployeeId);

        Assert.Null(result.Payload);
    }

    [Fact]
    public async Task GetJobById_is_unrestricted_when_no_employee_id_is_supplied()
    {
        // The Owner/Admin path - JobController passes null for anyone who isn't an Employee.
        var (context, workspaceId, _, _, _, unassignedJob) = await Seed();
        var service = new JobService(context);

        var result = await service.GetJobById(unassignedJob.Id, workspaceId, restrictToEmployeeId: null);

        Assert.NotNull(result.Payload);
    }

    [Fact]
    public async Task GetJobsByWorkspace_only_returns_jobs_the_employee_is_assigned_to()
    {
        var (context, workspaceId, assignedEmployeeId, _, assignedJob, unassignedJob) = await Seed();
        var service = new JobService(context);

        var result = await service.GetJobsByWorkspace(workspaceId, pageNumber: 1, pageSize: 50, restrictToEmployeeId: assignedEmployeeId);

        var ids = result.Payload!.Items.Select(j => j.Id).ToList();
        Assert.Contains(assignedJob.Id, ids);
        Assert.DoesNotContain(unassignedJob.Id, ids);
    }

    [Fact]
    public async Task GetJobsByFilter_only_returns_jobs_the_employee_is_assigned_to()
    {
        var (context, workspaceId, assignedEmployeeId, _, assignedJob, unassignedJob) = await Seed();
        var service = new JobService(context);

        var result = await service.GetJobsByFilter(new JobFilterDto(), workspaceId, pageNumber: 1, pageSize: 50, restrictToEmployeeId: assignedEmployeeId);

        var ids = result.Payload!.Items.Select(j => j.Id).ToList();
        Assert.Contains(assignedJob.Id, ids);
        Assert.DoesNotContain(unassignedJob.Id, ids);
    }

    [Fact]
    public async Task UpdateJob_rejects_a_job_the_employee_is_not_assigned_to()
    {
        var (context, workspaceId, assignedEmployeeId, _, _, unassignedJob) = await Seed();
        var service = new JobService(context);

        var result = await service.UpdateJob(new UpdateJobDto { Id = unassignedJob.Id, Title = "Hijacked" }, workspaceId, assignedEmployeeId);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task UpdateJob_allows_a_job_the_employee_is_assigned_to()
    {
        var (context, workspaceId, assignedEmployeeId, _, assignedJob, _) = await Seed();
        var service = new JobService(context);

        var result = await service.UpdateJob(new UpdateJobDto { Id = assignedJob.Id, Title = "Updated" }, workspaceId, assignedEmployeeId);

        Assert.True(result.Success);
        Assert.Equal("Updated", result.Payload!.Title);
    }
}
