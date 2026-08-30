using backend.Data;
using backend.Dtos.LeadDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Services.LeadService;

public class LeadService : ILeadService
{
    private readonly DataContext _context;
    private readonly ILogger<LeadService> _logger;

    public LeadService(DataContext context, ILogger<LeadService>? logger = null)
    {
        _context = context;
        _logger = logger ?? NullLogger<LeadService>.Instance;
    }

    public async Task<ApiResponse<Lead>> GetLeadById(Guid id, Guid callerWorkspaceId)
    {
        var lead = await _context.Leads.Where(r => r.Id == id && r.WorkspaceId == callerWorkspaceId)
                                    .Include(r => r.Customer).ThenInclude(c => c!.CustomerPhones)
                                    .Include(r => r.Customer).ThenInclude(c => c!.EmailRecords)
                                    .Include(r => r.Customer).ThenInclude(c => c!.Properties)
                                    .Include(r => r.LineItems)
                                    .FirstOrDefaultAsync();

        return new ApiResponse<Lead>
        {
            Success = true,
            Payload = lead,
            ErrorMessage = null
        };
    }


    public async Task<ApiResponse<List<Lead>>> GetLeadsByWorkspaceId(Guid workspaceId)
    {
        var leads = await _context.Leads.Where(r => r.WorkspaceId == workspaceId)
                                            .Include(r => r.Customer)
                                            .ThenInclude(c => c!.EmailRecords)
                                            .Include(r => r.LineItems)
                                            .ToListAsync();

        return new ApiResponse<List<Lead>>
        {
            Success = true,
            Payload = leads,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Lead>>> GetLeadsByCustomerId(Guid customerId, Guid callerWorkspaceId)
    {
        var leads = await _context.Leads.Where(r => r.CustomerId == customerId && r.WorkspaceId == callerWorkspaceId)
                                            .Include(r => r.Customer)
                                            .ThenInclude(c => c!.EmailRecords)
                                            .Include(r => r.LineItems)
                                            .ToListAsync();

        return new ApiResponse<List<Lead>>
        {
            Success = true,
            Payload = leads,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Lead>> CreateLead(CreateLeadDto createLeadDto)
    {
        var lead = createLeadDto.Adapt<Lead>();
        lead.Id = Guid.NewGuid();

        if (createLeadDto.LineItems != null && createLeadDto.LineItems.Count != 0)
        {
            var lineItemsToProcess = new List<LineItem>();

            foreach (var itemDto in createLeadDto.LineItems)
            {
                var newLineItem = new LineItem
                {
                    Id = Guid.NewGuid(),
                    LeadId = lead.Id,
                };

                if (itemDto.ServiceItemId.HasValue && itemDto.ServiceItemId.Value != Guid.Empty)
                {
                    var serviceItem = await _context.ServiceItems
                                                    .AsNoTracking()
                                                    .FirstOrDefaultAsync(si => si.Id == itemDto.ServiceItemId.Value);

                    if (serviceItem != null)
                    {
                        newLineItem.ServiceItemId = serviceItem.Id;
                        newLineItem.Name = serviceItem.Name;
                        newLineItem.Description = serviceItem.Description;
                        newLineItem.UnitPrice = serviceItem.UnitPrice;
                        newLineItem.Cost = serviceItem.Cost;
                        newLineItem.IsTaxable = serviceItem.IsTaxable;
                        newLineItem.Quantity = itemDto.Quantity;
                    }
                    else
                    {
                        _logger.LogWarning("Service item {ServiceItemId} was not found; using custom lead line item data", itemDto.ServiceItemId.Value);
                        newLineItem.Name = itemDto.Name ?? "";
                        newLineItem.Description = itemDto.Description;
                        newLineItem.UnitPrice = itemDto.UnitPrice;
                        newLineItem.Cost = itemDto.Cost ?? 0;
                        newLineItem.IsTaxable = itemDto.IsTaxable ?? false;
                        newLineItem.Quantity = itemDto.Quantity;
                    }
                }
                else
                {
                    newLineItem.Name = itemDto.Name ?? "";
                    newLineItem.Description = itemDto.Description;
                    newLineItem.UnitPrice = itemDto.UnitPrice;
                    newLineItem.Cost = itemDto.Cost ?? 0;
                    newLineItem.IsTaxable = itemDto.IsTaxable ?? false;
                    newLineItem.Quantity = itemDto.Quantity;
                }

                lineItemsToProcess.Add(newLineItem);
            }
            lead.LineItems = lineItemsToProcess;
        }

        if (createLeadDto.CustomerId.HasValue)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == createLeadDto.CustomerId.Value
                    && c.WorkspaceId == createLeadDto.WorkspaceId);
            if (customer == null)
            {
                return new ApiResponse<Lead>
                {
                    Success = false,
                    ErrorMessage = "Customer not found in this workspace.",
                    Payload = null
                };
            }

            customer.LastActivity = DateTime.UtcNow;
        }

        await _context.Leads.AddAsync(lead);
        await _context.SaveChangesAsync();

        return new ApiResponse<Lead>
        {
            Success = true,
            Payload = lead,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Lead>> UpdateLead(UpdateLeadDto updatedLeadDto, Guid callerWorkspaceId)
    {
        var lead = await _context.Leads
            .Include(r => r.LineItems)
            .FirstOrDefaultAsync(r => r.Id == updatedLeadDto.Id);

        if (lead == null || lead.WorkspaceId != callerWorkspaceId)
        {
            return new ApiResponse<Lead>
            {
                Success = false,
                ErrorMessage = $"Lead with ID {updatedLeadDto.Id} not found.",
                Payload = null
            };
        }

        if (updatedLeadDto.Description != null) lead.Description = updatedLeadDto.Description;
        if (updatedLeadDto.FirstName != null) lead.FirstName = updatedLeadDto.FirstName;
        if (updatedLeadDto.LastName != null) lead.LastName = updatedLeadDto.LastName;
        if (updatedLeadDto.Email != null) lead.Email = updatedLeadDto.Email;
        if (updatedLeadDto.PhoneNumber != null) lead.PhoneNumber = updatedLeadDto.PhoneNumber;
        if (updatedLeadDto.Source != null) lead.Source = updatedLeadDto.Source;
        if (updatedLeadDto.StartDateTime.HasValue) lead.StartDateTime = updatedLeadDto.StartDateTime.Value;
        if (updatedLeadDto.EndDateTime != null) lead.EndDateTime = updatedLeadDto.EndDateTime;
        if (updatedLeadDto.Status.HasValue) lead.Status = updatedLeadDto.Status.Value;
        if (updatedLeadDto.Priority.HasValue) lead.Priority = updatedLeadDto.Priority.Value;
        if (updatedLeadDto.Notes != null) lead.Notes = updatedLeadDto.Notes;

        lead.UpdatedAt = DateTime.UtcNow;

        if (updatedLeadDto.LineItems != null)
        {
            if (updatedLeadDto.LineItems.Count == 0)
            {
                _context.LineItems.RemoveRange(lead.LineItems);
                lead.LineItems.Clear();
            }
            else
            {
                var itemsToRemove = lead.LineItems
                    .Where(existingItem => !updatedLeadDto.LineItems.Any(dtoItem => dtoItem.Id == existingItem.Id && dtoItem.Id.HasValue))
                    .ToList();
                _context.LineItems.RemoveRange(itemsToRemove);

                foreach (var itemDto in updatedLeadDto.LineItems)
                {
                    if (itemDto.Id.HasValue && itemDto.Id.Value != Guid.Empty)
                    {
                        var existingLineItem = lead.LineItems.FirstOrDefault(li => li.Id == itemDto.Id.Value);

                        if (existingLineItem != null)
                        {
                            existingLineItem.ServiceItemId = itemDto.ServiceItemId ?? existingLineItem.ServiceItemId;
                            existingLineItem.Name = itemDto.Name ?? existingLineItem.Name;
                            existingLineItem.Description = itemDto.Description ?? existingLineItem.Description;
                            if (itemDto.UnitPrice.HasValue) existingLineItem.UnitPrice = itemDto.UnitPrice.Value;
                            if (itemDto.Quantity.HasValue) existingLineItem.Quantity = itemDto.Quantity.Value;

                            existingLineItem.UpdatedAt = DateTime.UtcNow;
                        }
                        else
                        {
                            // Case: DTO contains an ID, but it's not found in the currently loaded Lead.LineItems.
                            // As discussed, for consistency with your Invoice/Quote logic, we'll ignore it.
                            // If you intend to allow adding line items with client-provided IDs that might not
                            // be tied to THIS Lead, you'd create a new LineItem here.
                        }
                    }
                    else
                    {
                        var newLineItem = new LineItem
                        {
                            Id = Guid.NewGuid(),
                            LeadId = lead.Id,
                            ServiceItemId = itemDto.ServiceItemId,
                            Name = itemDto.Name ?? "",
                            Description = itemDto.Description,
                            UnitPrice = itemDto.UnitPrice ?? 0,
                            Quantity = itemDto.Quantity ?? 1,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        lead.LineItems.Add(newLineItem);
                    }
                }
            }
        }

        await _context.SaveChangesAsync();

        return new ApiResponse<Lead>
        {
            Success = true,
            Payload = lead,
            ErrorMessage = null
        };
    }

    public async Task DeleteLead(Guid id, Guid callerWorkspaceId)
    {
        var lead = await _context.Leads.FindAsync(id);
        if (lead == null) return;
        if (lead.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That lead is not in your workspace.");
        }

        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync();
    }
}
