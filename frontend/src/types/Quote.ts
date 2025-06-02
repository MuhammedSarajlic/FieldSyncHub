import { TCustomer } from './Customer';
import { TAddLineItem, TLineItem } from './LineItem';

export type TQuote = {
  id: string;
  workspaceId: string;
  quoteNumber: string;
  status: number;
  viewed: boolean;
  viewedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  customerId: string;
  customer: TCustomer;
  lineItems: TLineItem[];
  discountType: number;
  discountAmount: number;
  tax: number;
  subtotal: number;
  total: number;
  notes: string;
  internalNotes: string;
  attachmentUrls: string[];
};

export type TAddQuote = {
  workspaceId: string;
  status: number;
  createdBy: string;
  customerId: string;
  lineItems: TAddLineItem[];
  discountType: number;
  discountAmount: number;
  tax: number;
  notes: string;
  internalNotes: string;
  attachmentUrls: string[];
};
