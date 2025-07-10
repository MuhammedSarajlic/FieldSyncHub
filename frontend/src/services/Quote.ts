import { QuoteStatus } from '../constants/Enumeration/QuoteEnum/QuoteEnum';
import { TAddNote } from '../types/Note';
import { TAddQuote, TAddQuoteAttachment, TUpdateQuote } from '../types/Quote';
import api from './api';

export async function GetQuotesByWorkspace(
  workspaceId: string,
  pageNumber: number,
  pageSize: number
) {
  const response = await api.get(
    `/quote/workspace/${workspaceId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function GetQuoteById(quoteId: string) {
  const response = await api.get(`/quote/${quoteId}`);
  return response;
}

export async function GetQuotesByCustomer(customerId: string) {
  const response = await api.get(`/quote/customer/${customerId}`);
  return response;
}

export async function GetQuotesByFilter(
  workspaceId: string,
  pageNumber: number,
  pageSize: number,
  params: string
) {
  const response = await api.get(
    `/quote/workspace/${workspaceId}/filter?${params}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function GetQuoteStats(workspaceId: string) {
  const response = await api.get(`/quote/workspace/${workspaceId}/quote-stats`);
  return response;
}

export async function CreateQuote(quote: TAddQuote) {
  const response = await api.post('/quote', quote);
  return response;
}

export async function AddQuoteInternalNote(quoteId: string, note: TAddNote) {
  const response = await api.post(`/quote/${quoteId}/internal-note`, note);
  return response;
}

export async function AddQuoteCustomerNote(quoteId: string, note: TAddNote) {
  const response = await api.post(`/quote/${quoteId}/customer-note`, note);
  return response;
}

export async function AddQuoteAttachment(
  quoteId: string,
  attachment: TAddQuoteAttachment
) {
  const response = await api.post(`/quote/${quoteId}/attachment`, attachment);
  return response;
}

export async function UpdateQuote(quote: TUpdateQuote) {
  const response = await api.put(`/quote`, quote);
  return response;
}

export async function DeleteQuote(quoteId: string) {
  const response = await api.delete(`/quote/${quoteId}`);
  return response;
}

export async function ArchiveQuote(quoteId: string) {
  const response = await api.patch(`/quote/${quoteId}/archive`);
  return response;
}

export async function ChangeQuoteStatus(quoteId: string, status: QuoteStatus) {
  const response = await api.patch(
    `/quote/${quoteId}`,
    JSON.stringify(status),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response;
}
