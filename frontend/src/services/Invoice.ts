import { TAddInvoice, TRecordInvoicePayment, TUpdateInvoice } from '../types/Invoice';
import api from './api';

export async function GetAllInvoicesByWorkspaceId(
  workspaceId: string,
  pageNumber: number,
  pageSize: number
) {
  const response = await api.get(
    `/invoice/workspace/${workspaceId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function GetInvoiceById(invoiceId: string) {
  const response = await api.get(`/invoice/${invoiceId}`);
  return response;
}

export async function GetInvoiceByInvoiceNumber(invoiceNumber: string) {
  const response = await api.get(`/invoice/invoice-number/${invoiceNumber}`);
  return response;
}

export async function GetInvoicesByCustomer(customerId: string) {
  const response = await api.get(`/invoice/customer/${customerId}`);
  return response;
}

export async function GetInvoiceStats(wokrspaceId: string) {
  const response = await api.get(
    `/invoice/workspace/${wokrspaceId}/stats`
  );
  return response;
}

export async function GetInvoicesByFilter(
  workspaceId: string,
  pageNumber: number,
  pageSize: number,
  params: string
) {
  const response = await api.get(
    `/invoice/workspace/${workspaceId}/filter?${params}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function CreateInvoice(invoice: TAddInvoice) {
  const response = await api.post('/invoice', invoice);
  return response;
}

export async function UpdateInvoice(
  invoiceId: string,
  invoice: TUpdateInvoice
) {
  const response = await api.put(`/invoice/${invoiceId}`, invoice);
  return response;
}

export async function DeleteInvoice(invoiceId: string) {
  const response = await api.delete(`/invoice/${invoiceId}`);
  return response;
}

export async function RecordInvoicePayment(
  invoiceId: string,
  payment: TRecordInvoicePayment
) {
  const response = await api.post(`/invoice/${invoiceId}/payments`, payment);
  return response;
}
