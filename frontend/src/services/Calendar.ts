import api from './api';

export async function GetCalendarEventsByWorkspaceAndDateRange(
  workspaceId: string,
  startDate: string,
  endDate: string
) {
  const response = await api.get(
    `/calendar/workspace/${workspaceId}?startDate=${startDate}&endDate=${endDate}`
  );
  return response;
}
