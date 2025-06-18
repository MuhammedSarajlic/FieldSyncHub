import { TCustomer } from './Customer';
import { TWorkspace } from './Workspace';
import { TAddLineItem, TLineItem } from './LineItem';
import { TQuote } from './Quote';
import {
  RequestPriority,
  RequestStatus,
} from '../constants/Enumeration/RequestEnum/RequestEnum';

export type TRequest = {
  id: string;
  customerId: string;
  customer?: TCustomer;
  quoteId?: string;
  quote?: TQuote;
  workspaceId: string;
  workspace?: TWorkspace;
  requestedDate: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  status: RequestStatus;
  priority: RequestPriority;
  lineItems: TLineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddRequest = {
  customerId: string;
  quoteId?: string;
  workspaceId: string;
  requestedDate: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  priority: RequestPriority;
  lineItems: TAddLineItem[];
  notes?: string;
};

export type TUpdateRequest = {
  id: string;
  requestedDate?: string;
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  lineItems?: TAddLineItem[];
  notes?: string;
};
