import { TAddServiceItem } from '../types/ServiceItem';
import api from './api';

export async function GetServiceItems() {
  const response = await api.get('/service-item');
  return response;
}

export async function GetServiceItemsByFilter(params: string) {
  const response = await api.get(`/service-item/filter?${params}`);
  return response;
}

export async function CreateServiceItem(serviceItem: TAddServiceItem) {
  const response = await api.post('/service-item', serviceItem);
  return response;
}
