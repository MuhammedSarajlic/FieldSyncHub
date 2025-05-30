import { TAddInvoice, TUpdateInvoice } from '../types/Invoice';
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

export async function GetInvoiceByInvoiceNumber(invoiceNumber: string) {
  const response = await api.get(`/invoice/invoice-number/${invoiceNumber}`);
  return response;
}

export async function updateInvoice(
  invoiceId: string,
  invoice: TUpdateInvoice
) {
  const response = await api.put(`/invoice/${invoiceId}`, invoice);
  return response;
}
