import { LucideIcon } from 'lucide-react';
import { TAddCustomerPhone, TCustomerPhone } from './CustomerPhone';
import { TAddCustomField } from './CustomField';
import { TInvoice } from './Invoice';
import { TJob } from './Job';
import { TNote } from './Note';
import { TAddProperty, TProperty } from './Property';
import { TQuote } from './Quote';
import { TRequest } from './Request';

export type TCustomer = {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  displayName: string;
  isCompany: boolean;
  email: string[];
  isReceiveJobNotifications: boolean;
  isReceiveQuoteNotifications: boolean;
  isReceiveInvoiceNotifications: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  archived: boolean;
  tags: string[];
  properties: TProperty[];
  customerPhones: TCustomerPhone[];
  customFields: TAddCustomField[]; 
  notes: TNote[];
};

export type TAddCustomer = {
  workspaceId: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: string;
  email: string[];
  isReceiveJobNotifications: boolean;
  isReceiveQuoteNotifications: boolean;
  isReceiveInvoiceNotifications: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  properties: TAddProperty[];
  customerPhones: TAddCustomerPhone[];
  customFields: TAddCustomField[];
};

export type TImportCustomer = {
  firstName: string;
  lastName: string;
  companyName?: string;
  isCompany?: boolean;
  email?: string[];
  visitReminders?: boolean;
  jobFollowUps?: boolean;
  quoteFollowUps?: boolean;
  invoiceFollowUps?: boolean;
  archived?: boolean;
  tags?: string[];
  createdAt?: string;
};

export type TCustomerStats = {
  total: number;
  newCustomers: number;
  companies: number;
  individuals: number;
  missingInfoCustomers: number;
};

export type TCustomerTab = {
  id: string;
  label: string;
  count: number;
  loading: boolean;
  loaded: boolean;
  items: TQuote[] | TJob[] | TInvoice[] | TRequest[];
  icon: LucideIcon;
};
