import { TWorkspace } from './Workspace';

export type TEmployeeInvite = {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  isAccepted: boolean;
  role: string;
  workspace: TWorkspace;
  workspaceId: string;
};
