import api from './api';

export async function GetRequestsByCustomer(customerId: string) {
  const response = await api.get(`/request/customer/${customerId}`);
  return response;
}
