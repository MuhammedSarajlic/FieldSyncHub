import { TServiceItem } from './ServiceItem';

export type TLineItem = {
  id: string;
  serviceItemId?: string;
  serviceItem?: TServiceItem;
  name: string;
  description?: string;
  unitPrice: number;
  cost: number;
  isOptional: boolean;
  isTaxable: boolean;
  quantity: number;
  total: number;
  jobId?: string;
  invoiceId?: string;
  quoteId?: string;
  requestId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TGetLineItem = {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  isOptional: boolean;
  total: number;
};

export type TModalLineItem = {
  serviceItemId: string;
  serviceItem: TServiceItem;
  quantity: number;
};

export type TAddLineItem = {
  serviceItemId?: string;
  name: string;
  description?: string;
  unitPrice: number;
  cost?: number;
  isOptional: boolean;
  isTaxable?: boolean;
  quantity: number;
  jobId?: string;
  invoiceId?: string;
  quoteId?: string;
  requestId?: string;
};

export type TUpdateLineItem = {
  id?: string;
  serviceItemId?: string;
  name: string;
  description?: string;
  unitPrice: number;
  isTaxable?: boolean;
  quantity: number;
};
