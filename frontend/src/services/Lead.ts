import api from './api';

export async function GetLeadsByCustomer(customerId: string) {
  const response = await api.get(`/lead/customer/${customerId}`);
  return response;
}
