import { TCustomer } from './Customer';
import { TLineItem } from './LineItem';
import { TWorkspace } from './Workspace';

export type TRequest = {
  id: string;
  customerId: string;
  customer: TCustomer;
  workspaceId: string;
  workspace: TWorkspace;
  requestedDate: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  status: string;
  priority: string;
  lineItems: TLineItem[];
  notes: string;
};
