import { TCustomer } from './Customer';
import { TJob } from './Job';
import { TAddLineItem, TLineItem } from './LineItem';

export type TInvoice = {
  invoiceId: string;
  customerId: string;
  customer: TCustomer;
  workspaceId: string;
  invoiceNumber: string;
  jobId: string;
  job: TJob;
  items: TLineItem[];
  subtotal: number;
  taxRate: number;
  discount: number;
  discountType: string;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
  isPaid: boolean;
};

export type TAddInvoice = {
  customerId: string;
  jobId?: string;
  workspaceId: string;
  items: TAddLineItem[];
  taxRate: number;
  discount: number;
  discountType: string;
  issueDate: string;
  customDueDate?: string | undefined;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
};

export type TUpdateInvoice = {
  customerId: string;
  jobId?: string;
  items: TAddLineItem[];
  taxRate: number;
  discount: number;
  discountType: string;
  issueDate: string;
  paymentTerms: string;
  customDueDate?: string | undefined;
  notes: string;
  internalNotes: string;
};
