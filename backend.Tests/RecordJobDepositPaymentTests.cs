using backend.Data;
using backend.Dtos.JobDto;
using backend.Models;
using backend.Services.JobService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class RecordJobDepositPaymentTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    private static Job CreateJob(Guid workspaceId, Guid jobId, decimal depositAmount)
        => new()
        {
            Id = jobId,
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            Title = "Deck installation",
            StartDateTime = DateTime.UtcNow,
            EndDateTime = DateTime.UtcNow.AddHours(2),
            DepositAmount = depositAmount,
            LineItems =
            [
                new LineItem { Id = Guid.NewGuid(), Name = "Labor", UnitPrice = 200m, Quantity = 1 }
            ]
        };

    [Fact]
    public async Task RecordDepositPayment_adds_a_succeeded_payment_and_updates_deposit_balance()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var jobId = Guid.NewGuid();

        context.Jobs.Add(CreateJob(workspaceId, jobId, depositAmount: 50m));
        await context.SaveChangesAsync();

        var service = new JobService(context);
        var result = await service.RecordDepositPayment(
            jobId,
            new RecordJobDepositPaymentDto
            {
                Amount = 50m,
                Method = PaymentMethod.Cash,
                PaidAt = new DateTime(2026, 8, 29, 0, 0, 0, DateTimeKind.Utc),
                Note = "Deposit at booking"
            },
            workspaceId,
            userId);

        Assert.True(result.Success);
        var job = result.Payload!;
        Assert.Equal(50m, job.DepositPaid);
        Assert.Equal(0m, job.DepositBalanceDue);
        Assert.True(job.IsDepositPaid);
        Assert.Equal(PaymentStatus.Partial, job.PaymentStatus);
        Assert.Single(job.Payments);
        Assert.Equal(PaymentRecordStatus.Succeeded, job.Payments[0].Status);
        Assert.Equal(userId, job.Payments[0].RecordedByUserId);
        Assert.Null(job.Payments[0].InvoiceId);
        Assert.Equal(jobId, job.Payments[0].JobId);
    }

    [Fact]
    public async Task RecordDepositPayment_rejects_amount_over_remaining_deposit_balance()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var jobId = Guid.NewGuid();

        context.Jobs.Add(CreateJob(workspaceId, jobId, depositAmount: 50m));
        await context.SaveChangesAsync();

        var service = new JobService(context);
        var result = await service.RecordDepositPayment(
            jobId,
            new RecordJobDepositPaymentDto { Amount = 75m, Method = PaymentMethod.Cash },
            workspaceId,
            Guid.NewGuid());

        Assert.False(result.Success);
        Assert.Equal("Payment amount cannot exceed the remaining deposit balance.", result.ErrorMessage);
    }

    [Fact]
    public async Task RecordDepositPayment_rejects_when_job_has_no_deposit_amount()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var jobId = Guid.NewGuid();

        context.Jobs.Add(CreateJob(workspaceId, jobId, depositAmount: 0m));
        await context.SaveChangesAsync();

        var service = new JobService(context);
        var result = await service.RecordDepositPayment(
            jobId,
            new RecordJobDepositPaymentDto { Amount = 10m, Method = PaymentMethod.Cash },
            workspaceId,
            Guid.NewGuid());

        Assert.False(result.Success);
        Assert.Equal("This job doesn't have a deposit amount set.", result.ErrorMessage);
    }

    [Fact]
    public async Task RecordDepositPayment_rejects_once_deposit_is_fully_collected()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.Jobs.Add(CreateJob(workspaceId, jobId, depositAmount: 50m));
        await context.SaveChangesAsync();

        var service = new JobService(context);
        await service.RecordDepositPayment(
            jobId,
            new RecordJobDepositPaymentDto { Amount = 50m, Method = PaymentMethod.Cash },
            workspaceId,
            userId);

        var result = await service.RecordDepositPayment(
            jobId,
            new RecordJobDepositPaymentDto { Amount = 1m, Method = PaymentMethod.Cash },
            workspaceId,
            userId);

        Assert.False(result.Success);
        Assert.Equal("The deposit has already been paid in full.", result.ErrorMessage);
    }
}
