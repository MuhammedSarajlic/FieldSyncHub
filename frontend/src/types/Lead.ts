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
  customerId?: string;
  customer?: TCustomer;
  quoteId?: string;
  quote?: TQuote;
  workspaceId: string;
  workspace?: TWorkspace;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  source?: string;
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
  customerId?: string;
  workspaceId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  source?: string;
  description: string;
  startDateTime?: string;
  endDateTime?: string;
  priority: LeadPriority;
  lineItems: TAddLineItem[];
  notes?: string;
};

export type TUpdateLead = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  source?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  lineItems?: TAddLineItem[];
  notes?: string;
};
