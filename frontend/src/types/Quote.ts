import { TCustomer } from './Customer';
import { TDiscountType } from './Invoice';
import { TLineItem, TAddLineItem } from './LineItem';

export type TStatusQuote = 'Draft' | 'Sent' | 'AwaitingResponse' | 'AwaitingApproval' | 'Approved' | 'Declined' | 'Expired' | 'ConvertedToJob';

export type TQuote = {
  id: string;
  workspaceId: string;
  customerId: string;
  customer?: TCustomer;
  createdByUserId: string;
  quoteNumber: string;
  status: TStatusQuote;
  sentAt: string;
  viewed: boolean;
  viewedAt?: string;
  expiresAt?: string;
  lineItems: TLineItem[];
  discountType: TDiscountType;
  discountValue: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  customerNotes?: string;
  internalNotes?: string;
  attachmentUrls: string[]; 
};

export type TAddQuote = {
  workspaceId: string;
  customerId: string;
  createdByUserId: string;
  status: TStatusQuote;
  expiresAt?: string;
  lineItems: TAddLineItem[];
  discountType: TDiscountType;
  discountValue: number;
  taxRate: number;
  customerNotes?: string;
  internalNotes?: string;
  attachmentUrls: string[]; 
};
