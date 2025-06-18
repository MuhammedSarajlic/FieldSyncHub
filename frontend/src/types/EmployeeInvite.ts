import { UserRole } from '../constants/Enumeration/UserEnum/UserEnum';
import { TWorkspace } from './Workspace';

export type TEmployeeInvite = {
  id: string;
  workspaceId: string;
  workspace?: TWorkspace;
  email: string;
  token: string;
  role: UserRole;
  isAccepted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TEmployeeInviteRequest = {
  emails: string[];
  workspaceId: string;
};
