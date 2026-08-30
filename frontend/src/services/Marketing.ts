import api from './api';
export type MarketingSegment = { id: string; name: string; count: number };
export type MarketingCampaign = { id: string; name: string; subject: string; segment: string; sent: number; opened: number; clicked: number; sentAt?: string };
export const getSegments = () => api.get<MarketingSegment[]>('/marketing/segments');
export const getCampaigns = () => api.get<MarketingCampaign[]>('/marketing/campaigns');
export const sendCampaign = (payload: { name: string; subject: string; body: string; segment: string }) => api.post('/marketing/campaigns/send', payload);
