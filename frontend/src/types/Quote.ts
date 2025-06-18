import { DiscountType } from '../constants/Enumeration/CommonEnum/DiscountEnum';
import { QuoteStatus } from '../constants/Enumeration/QuoteEnum/QuoteEnum';
import { TCustomer } from './Customer';
import { TLineItem, TAddLineItem, TUpdateLineItem } from './LineItem';
import { TUser } from './User';

export type TQuote = {
  id: string;
  workspaceId: string;
  customerId: string;
  customer?: TCustomer;
  createdByUserId: string;
  createdByUser?: TUser;
  quoteNumber: string;
  status: QuoteStatus;
  sentAt?: string;
  viewed: boolean;
  viewedAt?: string;
  expiresAt?: string;
  lineItems: TLineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  customerNotes?: string;
  internalNotes?: string;
  attachments: TQuoteAttachment[];
};

export type TAddQuote = {
  workspaceId: string;
  customerId: string;
  createdByUserId: string;
  status: QuoteStatus;
  expiresAt?: string;
  lineItems: TAddLineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  customerNotes?: string;
  internalNotes?: string;
  attachmentUrls: TQuoteAttachment[];
};

export type TUpdateQuote = {
  id: string;
  expiresAt?: string;
  lineItems?: TUpdateLineItem[];
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number;
  customerNotes?: string;
  internalNotes?: string;
  attachmentUrls?: TUpdateQuoteAttachment[];
};

export type TQuoteFilter = {
  q?: string;
  sortBy?: string;
  sort?: string;
  status?: string;
  createdMin?: string;
  createdMax?: string;
  totalMin?: number;
  totalMax?: number;
};

export type TQuoteAttachment = {
  id: string;
  fileName: string;
  url?: string;
  quoteId: string;
  quote?: TQuote;
  createdAt: string;
};

export type TUpdateQuoteAttachment = {
  fileName: string;
  url?: string;
};
