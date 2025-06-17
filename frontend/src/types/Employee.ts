import { TUser } from './User';
import { TWorkspace } from './Workspace';

export type TStatus = 'Active' | 'OnLeave' | 'Terminated';

export type TEmployee = {
  id: string;
  userId: string;
  user: TUser;
  workspaceId: string;
  workspace: TWorkspace;
  position?: string;
  department?: string;
  status: TStatus;
  hireDate: string;
  phoneNumber?: string;
  imageUrl?: string;
  location?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TUpdateEmployee = {
  id: string;
  userId: string;
  workspaceId: string;
  position?: string;
  department?: string;
  status: TStatus;
  hireDate: string;
  phoneNumber?: string;
  imageUrl?: string;
  location?: string;
  isAvailable: boolean;
};

export type TUpdateEmployeeError = {
  position?: string;
  department?: string;
  hireDate?: string;
};
