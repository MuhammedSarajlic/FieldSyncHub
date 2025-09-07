import api from './api';

export async function GetAllLeads() {
  const response = await api.get(`/lead`);
  return response;
}

export async function GetLeadsByCustomer(customerId: string) {
  const response = await api.get(`/lead/customer/${customerId}`);
  return response;
}
