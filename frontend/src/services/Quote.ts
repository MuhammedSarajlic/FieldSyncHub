import { TAddQuote } from '../types/Quote';
import api from './api';

export async function GetQuoteByWorkspace(workspaceId: string) {
  const response = await api.get(`/quote/workspace/${workspaceId}`);
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

export async function CreateQuote(quote: TAddQuote) {
  const response = await api.post('/quote', quote);
  return response;
}
