using System.Text;
using backend.Data;
using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.ServiceItemService;

public class ServiceItemService : IServiceItemService
{
    private readonly DataContext _context;
    public ServiceItemService(DataContext context)
    {
        _context = context;
    }

    public async Task<ServiceItem> GetServiceItemById(Guid id)
    {
        var serviceItem = await _context.ServiceItems.FindAsync(id);
        return serviceItem ?? throw new KeyNotFoundException("Service item not found");
    }

    public async Task<ApiResponse<PagedResult<ServiceItem>>> GetServiceItemsByWorkspace(
            Guid workspaceId,
            int pageNumber,
            int pageSize
        )
    {
        var query = _context.ServiceItems
            .Where(s => s.WorkspaceId == workspaceId && s.IsActive && s.Category != null);

        var totalCount = await query.CountAsync();

        var items = await query.OrderByDescending(s => s.CreatedAt)
                               .Skip((pageNumber - 1) * pageSize)
                               .Take(pageSize)
                               .ToListAsync();

        var result = new PagedResult<ServiceItem>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return new ApiResponse<PagedResult<ServiceItem>>()
        {
            Success = true,
            Payload = result,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<PagedResult<ServiceItem>>> GetServiceItemsByFilter(
        ServiceItemFilterDto filterDto,
        Guid workspaceId,
        int pageNumber,
        int pageSize
    )
    {
        var queryable = _context.ServiceItems.Where(s => s.WorkspaceId == workspaceId);

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            queryable = queryable.Where(s => s.Name.Contains(filterDto.Q) ||
                                             (s.SKU != null && s.SKU.Contains(filterDto.Q)));
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Category))
        {
            queryable = queryable.Where(s => s.Category == filterDto.Category);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Type))
        {
            if (Enum.TryParse(filterDto.Type, true, out ServiceItemType parsedType))
            {
                queryable = queryable.Where(s => s.Type == parsedType);
            }
        }

        if (filterDto.PriceMin.HasValue)
        {
            queryable = queryable.Where(s => s.UnitPrice >= filterDto.PriceMin.Value);
        }

        if (filterDto.PriceMax.HasValue)
        {
            queryable = queryable.Where(s => s.UnitPrice <= filterDto.PriceMax.Value);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.IsActive))
        {
            if (filterDto.IsActive == "active")
            {
                queryable = queryable.Where(s => s.IsActive == true);
            }
            else
            {
                queryable = queryable.Where(s => s.IsActive == false);
            }
        }

        if (!string.IsNullOrWhiteSpace(filterDto.HasImage))
        {
            if (filterDto.HasImage == "has")
            {
                queryable = queryable.Where(s => !string.IsNullOrEmpty(s.ImageUrl));
            }
            else
            {
                queryable = queryable.Where(s => string.IsNullOrEmpty(s.ImageUrl));
            }
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Description))
        {
            queryable = queryable.Where(s => s.Description != null && s.Description.Contains(filterDto.Description));
        }

        queryable = filterDto.SortBy?.ToLower() switch
        {
            "name" => filterDto.Sort == "desc" ? queryable.OrderByDescending(s => s.Name) : queryable.OrderBy(s => s.Name),
            "price" => filterDto.Sort == "desc" ? queryable.OrderByDescending(s => s.UnitPrice) : queryable.OrderBy(s => s.UnitPrice),
            _ => queryable.OrderBy(s => s.Name)
        };

        var totalCount = await queryable.CountAsync();

        var pagedServiceItems = await queryable
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedResult<ServiceItem>
        {
            Items = pagedServiceItems,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return new ApiResponse<PagedResult<ServiceItem>>
        {
            Success = true,
            Payload = result,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<ServiceItemStatsDto>> GetPricebookStatsByWorkspace(Guid workspaceId)
    {
        var now = DateTime.UtcNow;
        var startOfCurrentMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfPreviousMonth = startOfCurrentMonth.AddMonths(-1);
        var endOfPreviousMonth = startOfCurrentMonth.AddSeconds(-1);

        // 1️⃣ Get ALL items in workspace (not limited by month)
        var allItems = await _context.ServiceItems
            .Where(s => s.WorkspaceId == workspaceId
                     && s.IsActive
                     && (s.Category == null || s.Category.ToLower() != "archived"))
            .ToListAsync();

        // 🟢 Overall totals (all time)
        var totalItems = allItems.Count;
        var totalMaterialItems = allItems.Count(i => i.Type == ServiceItemType.Material);
        var totalServiceItems = allItems.Count(i => i.Type == ServiceItemType.Service);
        var totalPricebookValue = allItems.Sum(i => i.UnitPrice);
        var averageItemPrice = totalItems > 0 ? totalPricebookValue / totalItems : 0;

        // 🔵 This month
        var itemsAddedThisMonth = allItems
            .Where(i => i.CreatedAt >= startOfCurrentMonth && i.CreatedAt <= now)
            .ToList();
        var itemsThisMonthCount = itemsAddedThisMonth.Count;
        var materialThisMonthCount = itemsAddedThisMonth.Count(i => i.Type == ServiceItemType.Material);
        var serviceThisMonthCount = itemsAddedThisMonth.Count(i => i.Type == ServiceItemType.Service);
        var avgPriceThisMonth = itemsThisMonthCount > 0
            ? itemsAddedThisMonth.Sum(i => i.UnitPrice) / itemsThisMonthCount
            : 0;

        // 🟠 Last month
        var itemsAddedLastMonth = allItems
            .Where(i => i.CreatedAt >= startOfPreviousMonth && i.CreatedAt <= endOfPreviousMonth)
            .ToList();
        var itemsLastMonthCount = itemsAddedLastMonth.Count;
        var materialLastMonthCount = itemsAddedLastMonth.Count(i => i.Type == ServiceItemType.Material);
        var serviceLastMonthCount = itemsAddedLastMonth.Count(i => i.Type == ServiceItemType.Service);
        var avgPriceLastMonth = itemsLastMonthCount > 0
            ? itemsAddedLastMonth.Sum(i => i.UnitPrice) / itemsLastMonthCount
            : 0;

        // 🔥 % changes month-over-month
        var totalItemsChange = CalculatePercentageChange(itemsThisMonthCount, itemsLastMonthCount);
        var materialItemsChange = CalculatePercentageChange(materialThisMonthCount, materialLastMonthCount);
        var serviceItemsChange = CalculatePercentageChange(serviceThisMonthCount, serviceLastMonthCount);
        var averageItemPriceChange = CalculatePercentageChange(avgPriceThisMonth, avgPriceLastMonth);

        // 🚀 Fill DTO
        var statsDto = new ServiceItemStatsDto
        {
            // overall totals
            TotalItems = totalItems,
            TotalMaterialItems = totalMaterialItems,
            TotalServiceItems = totalServiceItems,
            TotalPricebookValue = totalPricebookValue,
            AverageItemPrice = averageItemPrice,

            // this month vs last month changes
            TotalItemsChange = totalItemsChange,
            MaterialItemsChange = materialItemsChange,
            ServiceItemsChange = serviceItemsChange,
            AverageItemPriceChange = averageItemPriceChange
        };

        return new ApiResponse<ServiceItemStatsDto>
        {
            Success = true,
            Payload = statsDto
        };
    }



    public async Task<ServiceItem> CreateServiceItem(CreateServiceItemDto createServiceItemDto)
    {
        var item = createServiceItemDto.Adapt<ServiceItem>();
        item.Id = Guid.NewGuid();
        await _context.ServiceItems.AddAsync(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<ApiResponse<ServiceItem>> UpdateServiceItem(UpdateServiceItemDto updateServiceItemDto)
    {
        var existingServiceItem = await _context.ServiceItems.FindAsync(updateServiceItemDto.Id);

        if (existingServiceItem == null)
        {
            return new ApiResponse<ServiceItem>
            {
                Success = false,
                Payload = null,
                ErrorMessage = "Service item not found."
            };
        }

        existingServiceItem.Name = updateServiceItemDto.Name ?? existingServiceItem.Name;
        existingServiceItem.Description = updateServiceItemDto.Description ?? existingServiceItem.Description;
        existingServiceItem.Category = updateServiceItemDto.Category ?? existingServiceItem.Category;
        existingServiceItem.SKU = updateServiceItemDto.SKU ?? existingServiceItem.SKU;
        existingServiceItem.ImageUrl = updateServiceItemDto.ImageUrl ?? existingServiceItem.ImageUrl;

        if (updateServiceItemDto.Type.HasValue)
        {
            existingServiceItem.Type = updateServiceItemDto.Type.Value;
        }
        if (updateServiceItemDto.UnitPrice.HasValue)
        {
            existingServiceItem.UnitPrice = updateServiceItemDto.UnitPrice.Value;
        }
        if (updateServiceItemDto.Cost.HasValue)
        {
            existingServiceItem.Cost = updateServiceItemDto.Cost.Value;
        }
        if (updateServiceItemDto.IsTaxable.HasValue)
        {
            existingServiceItem.IsTaxable = updateServiceItemDto.IsTaxable.Value;
        }
        if (updateServiceItemDto.IsActive.HasValue)
        {
            existingServiceItem.IsActive = updateServiceItemDto.IsActive.Value;
        }

        existingServiceItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse<ServiceItem>
        {
            Success = true,
            Payload = existingServiceItem,
            ErrorMessage = null
        };
    }

    public async Task DeleteServiceItem(Guid id)
    {
        var serviceItem = await _context.ServiceItems.FirstOrDefaultAsync(s => s.Id == id);
        if (serviceItem == null) return;

        _context.ServiceItems.Remove(serviceItem);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<object>> ImportServiceItemsAsync(List<ImportedServiceItemDto> serviceItems, Guid workspaceId)
    {
        if (serviceItems == null || serviceItems.Count == 0)
        {
            return new ApiResponse<object>
            {
                Success = false,
                ErrorMessage = "No service items provided for import.",
                Payload = new { Imported = 0, Skipped = 0 }
            };
        }

        var existingServiceItems = await _context.ServiceItems
            .Where(si => si.WorkspaceId == workspaceId)
            .ToListAsync();

        var normalizedExisting = existingServiceItems.Select(si => new
        {
            Key = $"{si.Name?.Trim().ToLower() ?? ""}|{si.Type.ToString().Trim().ToLower()}|{si.SKU?.Trim().ToLower() ?? ""}",
            si.Id
        }).ToHashSet();

        var toImport = new List<ServiceItem>();
        int skippedCount = 0;

        foreach (var dto in serviceItems)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                skippedCount++;
                continue;
            }

            ServiceItemType itemTypeForComparison = dto.Type;

            var key = $"{dto.Name.Trim().ToLower()}|{itemTypeForComparison.ToString().Trim().ToLower()}|{dto.SKU?.Trim().ToLower() ?? ""}";

            if (normalizedExisting.Any(si => si.Key == key))
            {
                skippedCount++;
                continue;
            }

            var serviceItem = new ServiceItem
            {
                WorkspaceId = workspaceId,
                Name = dto.Name.Trim(),
                Description = dto.Description,
                Type = itemTypeForComparison,
                Category = dto.Category,
                SKU = dto.SKU?.Trim() ?? null,
                UnitPrice = dto.UnitPrice,
                Cost = dto.Cost,
                IsTaxable = dto.IsTaxable,
                IsActive = dto.IsActive,
                ImageUrl = dto.ImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            toImport.Add(serviceItem);
        }

        if (toImport.Any())
        {
            await _context.ServiceItems.AddRangeAsync(toImport);
            await _context.SaveChangesAsync();
        }

        return new ApiResponse<object>
        {
            Success = true,
            Payload = new
            {
                Imported = toImport.Count,
                Skipped = skippedCount
            },
        };
    }

    public async Task<IActionResult> ExportServiceItemsToCsvAsync(Guid workspaceId)
    {
        var serviceItems = await _context.ServiceItems
            .Where(si => si.WorkspaceId == workspaceId)
            .ToListAsync();

        if (serviceItems == null || serviceItems.Count == 0)
        {
            return new NotFoundResult();
        }

        var sb = new StringBuilder();

        sb.AppendLine("Name,Description,Type,Category,SKU,UnitPrice,Cost,IsTaxable,IsActive,ImageUrl");

        foreach (var item in serviceItems)
        {
            sb.AppendLine($"{EscapeCsvField(item.Name)},{EscapeCsvField(item.Description)},{item.Type},{EscapeCsvField(item.Category)},{EscapeCsvField(item.SKU)},{item.UnitPrice},{item.Cost},{item.IsTaxable},{item.IsActive},{EscapeCsvField(item.ImageUrl)}");
        }

        var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
        return new FileContentResult(csvBytes, "text/csv")
        {
            FileDownloadName = $"service_items_workspace_{workspaceId}.csv"
        };
    }

    private static string EscapeCsvField(string? field)
    {
        if (string.IsNullOrEmpty(field))
        {
            return "";
        }
        if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }
        return field;
    }

    public string CalculatePercentageChange(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            return current == 0 ? "0%" : "+100%";
        }

        var change = ((current - previous) / Math.Abs(previous)) * 100;
        return $"{(change >= 0 ? "+" : "")}{Math.Round(change, 1)}%";
    }

}