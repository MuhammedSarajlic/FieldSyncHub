import { DiscountType } from '../constants/Enumeration/CommonEnum/DiscountEnum';
import { InvoiceStatus } from '../constants/Enumeration/InvoiceEnum/InvoiceEnum';
import { TCustomer } from './Customer';
import { TJob } from './Job';
import { TAddLineItem, TLineItem, TUpdateLineItem } from './LineItem';

export type TInvoice = {
  id: string;
  customerId: string;
  customer: TCustomer;
  workspaceId: string;
  invoiceNumber: string;
  jobId?: string;
  job?: TJob;
  lineItems: TLineItem[];
  taxRate: number;
  discount: number;
  discountType: DiscountType;
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TAddInvoice = {
  customerId: string;
  workspaceId: string;
  jobId?: string;
  lineItems: TAddLineItem[];
  taxRate: number;
  discount: number;
  discountType: DiscountType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
};

export type TUpdateInvoice = {
  id: string;
  lineItems: TUpdateLineItem[];
  taxRate?: number;
  discount?: number;
  discountType?: DiscountType;
  status?: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
  isPaid?: boolean;
};

export type TInvoiceFilter = {
  q?: string;
  sortBy?: string;
  sort?: string;
  status?: string;
  dueDateMin?: string;
  dueDateMax?: string;
  totalMin?: number;
  totalMax?: number;
};

export type TInvoiceStats = {
  totalOutstanding: number;
  totalPaidThisMonth: number;
  overdueCount: number;
  averageInvoiceValue: number;
};
