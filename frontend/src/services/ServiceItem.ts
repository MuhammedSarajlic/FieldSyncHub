import { TAddServiceItem } from '../types/ServiceItem';
import api from './api';

export async function GetServiceItems() {
  const response = await api.get('/service-item');
  return response;
}

export async function GetServiceItemsByWorkspace(
  workspaceId: string,
  pageNumber: number,
  pageSize: number
) {
  const response = await api.get(
    `/service-item/workspace/${workspaceId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function GetServiceItemsStats(workspaceId: string) {
  const response = await api.get(`/service-item/stats/${workspaceId}`);
  return response;
}

export async function ExportServiceItems(workspaceId: string) {
  const response = await api.get(`/service-item/export/${workspaceId}`);
  return response;
}

export async function GetServiceItemsByFilter(
  workspaceId: string,
  pageNumber: number,
  pageSize: number,
  params: string
) {
  const response = await api.get(
    `/service-item/workspace/${workspaceId}/filter?${params}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function CreateServiceItem(serviceItem: TAddServiceItem) {
  const response = await api.post('/service-item', serviceItem);
  return response;
}
