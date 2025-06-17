import { TCustomer } from './Customer';
import { TWorkspace } from './Workspace';
import { TLineItem } from './LineItem';

export type TStatusRequest = 'Pending' | 'Reviewed' | 'Approved' | 'Declined' | 'Converted';

export type TPriorityRequest = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TRequest = {
  id: string;
  customerId: string;
  customer?: TCustomer;
  workspaceId: string;
  workspace?: TWorkspace;
  requestedDate: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  status: TStatusRequest;
  priority:TPriorityRequest;
  lineItems: TLineItem[];
  notes?: string;
};
