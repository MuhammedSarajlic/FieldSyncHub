import { TAddCustomer, TImportCustomer } from '../types/Customer';
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

export async function GetCustomerByWorkspace(
  workspaceId: string,
  pageNumber: number,
  pageSize: number
) {
  const response = await api.get(
    `/customer/workspace/${workspaceId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function ImportCustomers(
  customers: TImportCustomer[],
  workspaceId: string
) {
  const response = await api.post(
    `/customer/import?workspaceId=${workspaceId}`,
    customers
  );
  return response;
}

export async function GetCustomersByFilter(
  workspaceId: string,
  pageNumber: number,
  pageSize: number,
  params: string
) {
  const response = await api.get(
    `/customer/workspace/${workspaceId}/filter?${params}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function AddCustomerTag(id: string, tag: string) {
  const response = await api.patch(
    `/customer/${id}/tags`,
    JSON.stringify(tag),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response;
}

export async function RemoveCustomerTag(id: string, tag: string) {
  const response = await api.patch(
    `/customer/${id}/tags/remove`,
    JSON.stringify(tag),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response;
}

export async function ArchiveCustomer(id: string) {
  const response = await api.patch(`/customer/${id}/archive`);
  return response;
}

export async function GetCustomerStats(workspaceId: string) {
  const response = await api.get(`/customer/stats/${workspaceId}`);
  return response;
}

export async function SendCustomerEmail(
  email: string,
  subject: string,
  message: string
) {
  const response = await api.post(
    `/customer/send-mail?to=${email}&subject=${subject}&message=${message}`
  );
  return response;
}
