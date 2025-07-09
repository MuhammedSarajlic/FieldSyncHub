import { DiscountType } from '../constants/Enumeration/CommonEnum/DiscountEnum';
import { QuoteStatus } from '../constants/Enumeration/QuoteEnum/QuoteEnum';
import { TActivityHistory, TAddActivityHistory } from './ActivityHistory';
import { TCustomer } from './Customer';
import { TLineItem, TAddLineItem, TUpdateLineItem } from './LineItem';
import { TAddNote, TNote } from './Note';
import { TProperty } from './Property';
import { TUser } from './User';

export type TQuote = {
  id: string;
  workspaceId: string;
  jobId?: string;
  customerId: string;
  customer?: TCustomer;
  createdByUserId: string;
  createdByUser?: TUser;
  assignedToUserId: string;
  assignedToUser: TUser;
  title: string;
  propertyId: string;
  property?: TProperty;
  quoteNumber: string;
  status: QuoteStatus;
  sentAt?: string;
  viewed: boolean;
  viewedAt?: string;
  expiresAt: string;
  lineItems: TLineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  customerNotes: TNote[];
  internalNotes: TNote[];
  customerMessages?: string[];
  activityHistory: TActivityHistory[];
  source?: string;
  attachments: TQuoteAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type TAddQuote = {
  workspaceId: string;
  customerId: string;
  createdByUserId: string;
  assignedToUserId: string;
  status: QuoteStatus;
  title: string;
  propertyId?: string;
  lineItems: TAddLineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  customerNotes?: TAddNote[];
  internalNotes?: TAddNote[];
  activityHistory: TAddActivityHistory[];
  source?: string;
};

export type TUpdateQuote = {
  id: string;
  assignedToUserId: string;
  lineItems: TUpdateLineItem[];
  title: string;
  propertyId: string;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  source: string;
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
  url: string;
  quoteId: string;
  quote?: TQuote;
  createdAt: string;
};

export type TAddQuoteAttachment = {
  fileName: string;
  url: string;
};

export type TQuoteStats = {
  totalQuotes: number;
  totalValue: number;
  approvedValue: number;
  conversionRate: number;
};
