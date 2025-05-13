import { TServiceItem } from './ServiceItem';

export type TLineItem = {
  lineItemId: string;
  serviceItemId: string;
  serviceItem: TServiceItem;
  quantity: number;
  totalPrice: number;
  jobId: string;
};

export type TModalLineItem = {
  serviceItemId: string;
  serviceItem: TServiceItem;
  quantity: number;
};

export type TAddLineItem = {
  serviceItemId: string;
  //   serviceItem: TServiceItem;
  quantity: number;
};
