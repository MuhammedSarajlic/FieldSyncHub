import { TAddEvent } from '../types/Event';
import api from './api';

export async function GetEventsByWorkspace(workspaceId: string) {
  const response = await api.get(`/event/workspace/${workspaceId}`);
  return response;
}

export async function CreateEvent(event: TAddEvent) {
  const response = await api.post(`/event`, event);
  return response;
}
