import { TAddQuote } from '../types/Quote';
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
