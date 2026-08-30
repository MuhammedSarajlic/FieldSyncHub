import api from './api';

export type Subscription = {
  id: string;
  plan: string;
  seatCount: number;
  status: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
};

export const getSubscription = () => api.get<Subscription>('/subscription');
export const changePlan = (plan: string, seatCount: number) =>
  api.put('/subscription/plan', { plan, seatCount });
