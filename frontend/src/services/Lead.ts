import { TAddLead } from '../types/Lead';
import api from './api';

export async function CreateLead(lead: TAddLead) {
  const response = await api.post('/lead', lead);
  return response;
}

export async function GetAllLeads() {
  const response = await api.get(`/lead`);
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
