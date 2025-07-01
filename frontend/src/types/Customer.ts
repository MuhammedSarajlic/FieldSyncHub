import { LucideIcon } from 'lucide-react';
import { TAddCustomerPhone, TCustomerPhone } from './CustomerPhone';
import { TInvoice } from './Invoice';
import { TJob } from './Job';
import { TNote } from './Note';
import { TAddProperty, TProperty } from './Property';
import { TQuote } from './Quote';
import { TRequest } from './Request';
import { TAddCustomFieldValue, TCustomFieldValue } from './CustomFieldValue';

export type TCustomer = {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  displayName: string;
  isCompany: boolean;
  emails: string[];
  isReceiveJobNotifications: boolean;
  isReceiveQuoteNotifications: boolean;
  isReceiveInvoiceNotifications: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  billingAddress: string;
  isArchived: boolean;
  tags: string[];
  customFieldValues: TCustomFieldValue[];
  notes: TNote[];
  properties: TProperty[];
  customerPhones: TCustomerPhone[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddCustomer = {
  workspaceId: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: string;
  emails: string[];
  isReceiveJobNotifications: boolean;
  isReceiveQuoteNotifications: boolean;
  isReceiveInvoiceNotifications: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  customFieldValues?: TAddCustomFieldValue[];
  properties?: TAddProperty[];
  customerPhones?: TAddCustomerPhone[];
};

export type TUpdateCustomer = {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  displayName?: string;
  emails?: string[];
  isReceiveJobNotifications?: boolean;
  isReceiveQuoteNotifications?: boolean;
  isReceiveInvoiceNotifications?: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  customFieldValues?: TAddCustomFieldValue[];
  properties?: TAddProperty[];
  customerPhones?: TAddCustomerPhone[];
};

export type TImportCustomer = {
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: boolean;
  emails: string[];
  isReceiveJobNotifications: boolean;
  isReceiveQuoteNotifications: boolean;
  isReceiveInvoiceNotifications: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  tags: string[];
  properties: TAddProperty[];
  customerPhones: TAddCustomerPhone[];
};

export type TCustomerStats = {
  total: number;
  companies: number;
  individuals: number;
  newCustomers: number;
  missingInfoCustomers: number;
};

export type TCustomerDetailsStats = {
  totalQuotes: number;
  totalJobs: number;
  totalInvoiced: number;
  invoicesCount: number;
  lastActivity: string;
};

export type TCustomerFilter = {
  q?: string;
  sortBy?: string;
  sort?: string;
  customerType?: string;
  createdDateMin?: string;
  createdDateMax?: string;
  propertiesMin?: number;
  propertiesMax?: number;
  hasEmail?: boolean;
  hasPhone?: boolean;
  tags?: string;
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
