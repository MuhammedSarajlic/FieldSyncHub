import { TCustomer } from './Customer';
import { TWorkspace } from './Workspace';
import { TAddLineItem, TLineItem } from './LineItem';
import { TQuote } from './Quote';
import {
  LeadPriority,
  LeadStatus,
} from '../constants/Enumeration/LeadEnum/LeadEnum';

export type TLead = {
  id: string;
  // customerId: string;
  // customer?: TCustomer;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  quoteId?: string;
  quote?: TQuote;
  workspaceId: string;
  workspace?: TWorkspace;
  // requestedDate: string;
  description: string;
  startDateTime?: string;
  endDateTime?: string;
  status: LeadStatus;
  priority: LeadPriority;
  lineItems: TLineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddLead = {
  // customerId: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  quoteId?: string;
  workspaceId: string;
  // requestedDate: string;
  description: string;
  startDateTime?: string;
  endDateTime?: string;
  priority: LeadPriority;
  lineItems: TAddLineItem[];
  notes?: string;
};

export type TUpdateLead = {
  id: string;
  // requestedDate?: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  lineItems?: TAddLineItem[];
  notes?: string;
};
