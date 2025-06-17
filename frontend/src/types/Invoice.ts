import { TCustomer } from './Customer';
import { TJob } from './Job';
import { TAddLineItem, TLineItem } from './LineItem';

export type TDiscountType = 'Percentage' | 'FixedAmount';

export type TStatus = 'Draft' | 'Sent' | 'AwaitingResponse' | 'AwaitingApproval' | 'Approved' | 'Declined' | 'Expired' | 'ConvertedToJob';

export type TInvoice = {
  invoiceId: string;
  customerId: string;
  customer: TCustomer;
  workspaceId: string;
  invoiceNumber: string;
  jobId?: string;
  job?: TJob;
  items: TLineItem[];
  subtotal: number;
  taxRate: number;
  discount: number;
  discountType: TDiscountType;
  total: number;
  status: TStatus;
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
  items: TAddLineItem[];
  taxRate: number;
  discount: number;
  discountType: TDiscountType;
  status: TStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
};

export type TUpdateInvoice = {
  id: string;
  items: TAddLineItem[];
  taxRate?: number;
  discount?: number;
  discountType?: TDiscountType;
  status?: TStatus;
  issueDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
  isPaid?: boolean;
};
