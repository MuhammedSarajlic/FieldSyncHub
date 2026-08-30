import { DiscountType } from '../constants/Enumeration/CommonEnum/DiscountEnum';
import { InvoiceStatus } from '../constants/Enumeration/InvoiceEnum/InvoiceEnum';
import { TCustomer } from './Customer';
import { TJob } from './Job';
import { TAddLineItem, TLineItem, TUpdateLineItem } from './LineItem';
import { TProperty } from './Property';

export enum PaymentMethod {
  Cash,
  Check,
  CardOnSite,
  Card,
  BankTransfer,
  Other,
}

export enum PaymentRecordStatus {
  Pending,
  Succeeded,
  Failed,
  Voided,
  Refunded,
}

export type TPayment = {
  id: string;
  invoiceId?: string | null;
  jobId?: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentRecordStatus;
  processorReference?: string | null;
  paidAt?: string | null;
  recordedByUserId?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TRecordInvoicePayment = {
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  note?: string;
};

export type TInvoice = {
  id: string;
  customerId: string;
  customer: TCustomer;
  workspaceId: string;
  invoiceNumber: string;
  propertyId: string;
  property?: TProperty;
  jobId?: string;
  job?: TJob;
  title: string;
  lineItems: TLineItem[];
  taxRate: number;
  discount: number;
  discountType: DiscountType;
  subtotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
  isPaid: boolean;
  payments: TPayment[];
  createdAt: string;
  updatedAt: string;
};

export type TAddInvoice = {
  customerId: string;
  workspaceId: string;
  propertyId: string;
  jobId?: string;
  title: string;
  lineItems: TAddLineItem[];
  taxRate: number;
  discount: number;
  discountType: DiscountType;
  issueDate: string;
  dueDate?: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
};

export type TUpdateInvoice = {
  id: string;
  title: string;
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
