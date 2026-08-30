import api from './api';

export type AccountingConnection = {
  id: string;
  provider: string;
  status: string;
  externalAccountId?: string;
  lastSyncedAt?: string;
  lastError?: string;
};

export const getAccountingConnections = () => api.get<AccountingConnection[]>('/integrations/accounting');
export const connectAccounting = (provider: string) => api.put(`/integrations/accounting`, { provider });
export const syncAccounting = (provider: string) => api.post(`/integrations/accounting/${provider}/sync`);
