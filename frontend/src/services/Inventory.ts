import api from './api';

export type InventoryItem = {
  id: string;
  name: string;
  sku?: string;
  unitOfMeasure: string;
  stockLevel: number;
  reorderPoint: number;
  lowStock: boolean;
};

export type InventoryTransaction = {
  id: string;
  serviceItemId: string;
  quantityDelta: number;
  reason: string;
  jobId?: string;
  recordedByUserId?: string;
  createdAt: string;
};

export const getInventory = () => api.get<InventoryItem[]>('/inventory');
export const adjustInventory = (serviceItemId: string, payload: { quantityDelta: number; reason: string; jobId?: string }) =>
  api.post(`/inventory/${serviceItemId}/adjust`, payload);
