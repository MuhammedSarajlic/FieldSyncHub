using backend.Data;
using backend.Models;
using backend.Services.EmployeeService;
using backend.Services.JobService;
using backend.Services.LeadService;
using backend.Services.NotesService;
using backend.Services.PropertyService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

/// <summary>
/// Every "get one record by GUID" endpoint used to trust the id alone with no
/// workspace check - the exact "company A reads company B by GUID" scenario. These
/// spot-check a representative sample of the fixed services: given a record that
/// belongs to workspace B, a caller from workspace A must not be able to read it,
/// and the record's own workspace must still be able to.
/// </summary>
public class CrossTenantByIdAccessTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task Job_GetJobById_is_scoped_to_the_callers_workspace()
    {
        await using var context = CreateContext();
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, FirstName = "A", LastName = "B" };
        var job = new Job { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, Title = "Fix roof", CustomerId = customer.Id };
        context.Customers.Add(customer);
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var service = new JobService(context);

        var crossTenant = await service.GetJobById(job.Id, ownWorkspace);
        Assert.Null(crossTenant.Payload);

        var sameTenant = await service.GetJobById(job.Id, otherWorkspace);
        Assert.NotNull(sameTenant.Payload);
    }

    [Fact]
    public async Task Employee_GetEmployeesById_is_scoped_to_the_callers_workspace()
    {
        await using var context = CreateContext();
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var user = new User { Id = Guid.NewGuid(), Email = "employee@acme.test", FirstName = "A", LastName = "B" };
        var employee = new Employee { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, UserId = user.Id };
        context.Users.Add(user);
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var service = new EmployeeService(context);

        var crossTenant = await service.GetEmployeesById(employee.Id, ownWorkspace);
        Assert.Null(crossTenant.Payload);

        var sameTenant = await service.GetEmployeesById(employee.Id, otherWorkspace);
        Assert.NotNull(sameTenant.Payload);
    }

    [Fact]
    public async Task Lead_GetLeadById_is_scoped_to_the_callers_workspace()
    {
        await using var context = CreateContext();
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, FirstName = "A", LastName = "B" };
        var lead = new Lead { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, CustomerId = customer.Id };
        context.Customers.Add(customer);
        context.Leads.Add(lead);
        await context.SaveChangesAsync();

        var service = new LeadService(context);

        var crossTenant = await service.GetLeadById(lead.Id, ownWorkspace);
        Assert.Null(crossTenant.Payload);

        var sameTenant = await service.GetLeadById(lead.Id, otherWorkspace);
        Assert.NotNull(sameTenant.Payload);
    }

    [Fact]
    public async Task Property_GetPropertyById_is_scoped_via_the_owning_customers_workspace()
    {
        await using var context = CreateContext();
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, FirstName = "A", LastName = "B" };
        var property = new Property { Id = Guid.NewGuid(), CustomerId = customer.Id, Street = "1 Main St" };
        context.Customers.Add(customer);
        context.Properties.Add(property);
        await context.SaveChangesAsync();

        var service = new PropertyService(context);

        var crossTenant = await service.GetPropertyById(property.Id, ownWorkspace);
        Assert.False(crossTenant.Success);

        var sameTenant = await service.GetPropertyById(property.Id, otherWorkspace);
        Assert.True(sameTenant.Success);
    }

    [Fact]
    public async Task Note_GetNoteById_is_scoped_to_the_callers_workspace()
    {
        await using var context = CreateContext();
        var ownWorkspace = Guid.NewGuid();
        var otherWorkspace = Guid.NewGuid();
        var note = new Note { Id = Guid.NewGuid(), WorkspaceId = otherWorkspace, CreatedBy = "system", CreatedByName = "System" };
        context.Notes.Add(note);
        await context.SaveChangesAsync();

        var service = new NotesService(context, new NoopStorageService());

        var crossTenant = await service.GetNoteById(note.Id, ownWorkspace);
        Assert.Null(crossTenant.Payload);

        var sameTenant = await service.GetNoteById(note.Id, otherWorkspace);
        Assert.NotNull(sameTenant.Payload);
    }
}
