import { TServiceItem } from './ServiceItem';

export type TLineItem = {
  lineItemId: string;
  serviceItemId?: string;
  serviceItem?: TServiceItem;
  name?: string;
  unitPrice?: number;
  description?: string;
  quantity: number;
  totalPrice: number;
  jobId?: string;
  invoiceId?: string;
};

export type TModalLineItem = {
  serviceItemId: string;
  serviceItem: TServiceItem;
  quantity: number;
};

export type TAddLineItem = {
  serviceItemId?: string;
  quantity: number;
  name?: string;
  unitPrice?: number;
  description?: string;
};
