import { TAddCustomerPhone, TCustomerPhone } from './CustomerPhone';
import { TAddCustomField } from './CustomField';
import { TNote } from './Note';
import { TAddProperty, TProperty } from './Property';

export type TCustomer = {
  customerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName: string;
  isCompany: boolean;
  email: string[];
  visitReminders: boolean;
  jobFollowUps: boolean;
  quoteFollowUps: boolean;
  invoiceFollowUps: boolean;
  archived: boolean;
  tags: string[];
  properties: TProperty[];
  customerPhones: TCustomerPhone[];
  customFields: TAddCustomField[];
  notes: TNote[];
};

export type TAddCustomer = {
  firstName: string;
  lastName: string;
  companyName: string;
  isCompany: boolean;
  email: string[];
  visitReminders: boolean;
  jobFollowUps: boolean;
  quoteFollowUps: boolean;
  invoiceFollowUps: boolean;
  properties: TAddProperty[];
  customerPhones: TAddCustomerPhone[];
  customFields: TAddCustomField[];
};
