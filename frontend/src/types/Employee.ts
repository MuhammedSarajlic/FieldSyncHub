import { TUser } from './User';
import { TWorkspace } from './Workspace';

export type TEmployee = {
  department: string;
  hireDate: string;
  id: string;
  position: string;
  status: string;
  user: TUser;
  userId: string;
  workspace: TWorkspace;
  workspaceId: string;
  imageUrl?: string;
};

export type TUpdateEmployee = {
  id: string;
  userId: string;
  workspaceId: string;
  position: string;
  department: string;
  status: string;
  hireDate: string;
};

export type TUpdateEmployeeError = {
  position: string;
  department: string;
  hireDate: string;
};
