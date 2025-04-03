import { TAddCustomer } from '../types/Customer';
import api from './api';

export async function CreateCustomer(customer: TAddCustomer) {
  const response = await api.post('/customer', customer);
  return response;
}

export async function GetAllCustomers() {
  const response = await api.get('/customer');
  return response;
}

export async function GetCustomerById(id: string) {
  const response = await api.get(`/customer/${id}`);
  return response;
}
