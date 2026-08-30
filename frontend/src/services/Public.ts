import axios from 'axios';

const publicApi = axios.create({ baseURL: import.meta.env.VITE_BASE_URL || '/api' });

export const getPortalDocument = (token: string) => publicApi.get(`/portal/${encodeURIComponent(token)}`);
export const approvePortalQuote = (token: string) => publicApi.post(`/portal/${encodeURIComponent(token)}/approve`);
export const createBooking = (workspaceId: string, payload: Record<string, unknown>) => publicApi.post(`/booking/${workspaceId}`, payload);
export const getReview = (token: string) => publicApi.get(`/review/${encodeURIComponent(token)}`);
export const submitReview = (token: string, payload: { rating: number; comment?: string }) => publicApi.post(`/review/${encodeURIComponent(token)}`, payload);
