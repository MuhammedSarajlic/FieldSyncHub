using backend.Data;
using backend.Dtos.RequestDto;
using backend.Models;
using backend.Models.RequestModels;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.RequestService;

public class RequestService : IRequestService
{
    private readonly DataContext _context;

    public RequestService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Request>>> GetAllRequests()
    {
        var requests = await _context.Requests.Include(r => r.Customer)
                                    .Include(r => r.LineItems)
                                        .ThenInclude(l => l.ServiceItem)
                                    .ToListAsync();

        return new ApiResponse<List<Request>>
        {
            Success = true,
            Payload = requests,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Request>> GetRequestById(Guid id)
    {
        var request = await _context.Requests.Where(r => r.Id == id)
                                    .Include(r => r.Customer)
                                    .Include(r => r.LineItems)
                                    .FirstOrDefaultAsync();

        return new ApiResponse<Request>
        {
            Success = true,
            Payload = request,
            ErrorMessage = null
        };
    }


    public async Task<ApiResponse<List<Request>>> GetRequestsByWorkspaceId(Guid workspaceId)
    {
        var requests = await _context.Requests.Where(r => r.WorkspaceId == workspaceId)
                                            .Include(r => r.Customer)
                                            .Include(r => r.LineItems)
                                            .ToListAsync();

        return new ApiResponse<List<Request>>
        {
            Success = true,
            Payload = requests,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Request>>> GetRequestByCustomerId(Guid customerId)
    {
        var requests = await _context.Requests.Where(r => r.CustomerId == customerId)
                                            .Include(r => r.Customer)
                                            .Include(r => r.LineItems)
                                            .ToListAsync();

        return new ApiResponse<List<Request>>
        {
            Success = true,
            Payload = requests,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Request>> CreateRequest(CreateRequestDto createRequestDto)
    {
        var request = createRequestDto.Adapt<Request>();
        request.Id = Guid.NewGuid();

        if (createRequestDto.LineItems != null && createRequestDto.LineItems.Count != 0)
        {
            var lineItemsToProcess = new List<LineItem>();

            foreach (var itemDto in createRequestDto.LineItems)
            {
                var newLineItem = new LineItem
                {
                    Id = Guid.NewGuid(),
                    RequestId = request.Id,
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
                        Console.WriteLine($"Warning: ServiceItem with ID {itemDto.ServiceItemId.Value} not found. Using custom data if provided.");
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
            request.LineItems = lineItemsToProcess;

            var customer = await _context.Customers.FindAsync(createRequestDto.CustomerId);
            customer.LastActivity = DateTime.UtcNow;

            await _context.Requests.AddAsync(request);
            await _context.SaveChangesAsync();

        }
        return new ApiResponse<Request>
        {
            Success = true,
            Payload = request,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Request>> UpdateRequest(UpdateRequestDto updatedRequestDto)
    {
        // 1. Load the existing Request entity from the database, including its LineItems
        var request = await _context.Requests
            .Include(r => r.LineItems) // Crucial for managing child LineItems
            .FirstOrDefaultAsync(r => r.Id == updatedRequestDto.Id);

        if (request == null)
        {
            return new ApiResponse<Request>
            {
                Success = false,
                ErrorMessage = $"Request with ID {updatedRequestDto.Id} not found.",
                Payload = null
            };
        }

        // 2. Update scalar properties of the existing, tracked 'request' entity
        // Using explicit assignments with null checks from the DTO, similar to your Invoice update.
        if (updatedRequestDto.RequestedDate.HasValue) request.RequestedDate = updatedRequestDto.RequestedDate.Value;
        if (updatedRequestDto.Description != null) request.Description = updatedRequestDto.Description;
        if (updatedRequestDto.PreferredDate.HasValue) request.PreferredDate = updatedRequestDto.PreferredDate.Value;
        if (updatedRequestDto.PreferredTime != null) request.PreferredTime = updatedRequestDto.PreferredTime;
        if (updatedRequestDto.Status.HasValue) request.Status = updatedRequestDto.Status.Value;
        if (updatedRequestDto.Priority.HasValue) request.Priority = updatedRequestDto.Priority.Value;
        if (updatedRequestDto.Notes != null) request.Notes = updatedRequestDto.Notes;

        // Update the main entity's UpdatedAt timestamp
        request.UpdatedAt = DateTime.UtcNow;

        // 3. Handle LineItems collection updates (same logic as Quote and Invoice)
        if (updatedRequestDto.LineItems != null) // Check if the line items collection was provided in the DTO
        {
            if (updatedRequestDto.LineItems.Count == 0)
            {
                // If an empty list is sent, remove all existing line items
                _context.LineItems.RemoveRange(request.LineItems);
                request.LineItems.Clear(); // Clear the in-memory collection
            }
            else
            {
                // a. Identify LineItems to REMOVE
                // Find existing line items that are NOT present in the updatedRequestDto.LineItems (by Id)
                var itemsToRemove = request.LineItems
                    .Where(existingItem => !updatedRequestDto.LineItems.Any(dtoItem => dtoItem.Id == existingItem.Id && dtoItem.Id.HasValue))
                    .ToList(); // .ToList() to execute the query immediately and avoid modified collection issues
                _context.LineItems.RemoveRange(itemsToRemove); // Mark for deletion

                // b. Iterate through DTO LineItems for UPDATES or ADDITIONS
                foreach (var itemDto in updatedRequestDto.LineItems)
                {
                    if (itemDto.Id.HasValue && itemDto.Id.Value != Guid.Empty) // This DTO item has a non-empty ID, so it's an existing one
                    {
                        var existingLineItem = request.LineItems.FirstOrDefault(li => li.Id == itemDto.Id.Value);

                        if (existingLineItem != null)
                        {
                            // Found existing line item: Update its properties
                            // Apply updates based on your UpdateLineItemDto
                            existingLineItem.ServiceItemId = itemDto.ServiceItemId ?? existingLineItem.ServiceItemId;
                            existingLineItem.Name = itemDto.Name ?? existingLineItem.Name;
                            existingLineItem.Description = itemDto.Description ?? existingLineItem.Description;
                            if (itemDto.UnitPrice.HasValue) existingLineItem.UnitPrice = itemDto.UnitPrice.Value;
                            if (itemDto.Quantity.HasValue) existingLineItem.Quantity = itemDto.Quantity.Value;

                            existingLineItem.UpdatedAt = DateTime.UtcNow;
                        }
                        else
                        {
                            // Case: DTO contains an ID, but it's not found in the currently loaded request.LineItems.
                            // As discussed, for consistency with your Invoice/Quote logic, we'll ignore it.
                            // If you intend to allow adding line items with client-provided IDs that might not
                            // be tied to THIS request, you'd create a new LineItem here.
                        }
                    }
                    else // This DTO item does NOT have a valid Id (Id is null or Guid.Empty) -> Treat as NEW
                    {
                        var newLineItem = new LineItem
                        {
                            Id = Guid.NewGuid(), // Generate a new unique ID for the new item
                            RequestId = request.Id, // Link to the parent Request
                            ServiceItemId = itemDto.ServiceItemId,
                            Name = itemDto.Name ?? "",
                            Description = itemDto.Description,
                            UnitPrice = itemDto.UnitPrice ?? 0,
                            Quantity = itemDto.Quantity ?? 1,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        request.LineItems.Add(newLineItem); // Add to the collection
                    }
                }
            }
        }

        // No need for _context.Update(request); because 'request' is already tracked.
        // EF Core's Change Tracker will detect all modifications, additions, and deletions
        // automatically when SaveChangesAsync is called.
        await _context.SaveChangesAsync();

        return new ApiResponse<Request>
        {
            Success = true,
            Payload = request,
            ErrorMessage = null
        };
    }

    public async Task DeleteRequest(Guid id)
    {
        var request = await _context.Requests.FindAsync(id);

        _context.Requests.Remove(request);
        await _context.SaveChangesAsync();
    }
}
