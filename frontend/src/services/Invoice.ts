import { TAddInvoice } from '../types/Invoice';
import api from './api';

export async function CreateInvoice(invoice: TAddInvoice) {
  const response = await api.post('/invoice', invoice);
  return response;
}

export async function GetAllInvoices() {
  const response = await api.get('/invoice');
  return response;
}
export async function GetAllInvoicesByWorkspaceId(workspaceId: string) {
  const response = await api.get(`/invoice/workspace/${workspaceId}`);
  return response;
}
