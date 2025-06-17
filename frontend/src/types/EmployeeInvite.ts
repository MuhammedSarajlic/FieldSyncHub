import { TWorkspace } from './Workspace';

export type TRole = 'Admin' | 'Owner' | 'Employee';

export type TEmployeeInvite = {
  id: string;
  workspaceId: string;
  workspace: TWorkspace;
  email: string;
  token: string;
  role: TRole; 
  isAccepted: boolean;
  expiresAt: string;
};