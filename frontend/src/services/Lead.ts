import { TAddLead, TUpdateLead } from '../types/Lead';
import api from './api';

export async function CreateLead(lead: TAddLead) {
  const response = await api.post('/lead', lead);
  return response;
}

export async function GetLeadById(id: string) {
  const response = await api.get(`/lead/${id}`);
  return response;
}

export async function UpdateLead(lead: TUpdateLead) {
  const response = await api.put('/lead', lead);
  return response;
}

export async function DeleteLead(id: string) {
  const response = await api.delete(`/lead/${id}`);
  return response;
}

export async function GetLeadsByWorkspaceId(workspaceId: string) {
  const response = await api.get(`/lead/workspace/${workspaceId}`);
  return response;
}

export async function GetLeadsByCustomer(customerId: string) {
  const response = await api.get(`/lead/customer/${customerId}`);
  return response;
}
