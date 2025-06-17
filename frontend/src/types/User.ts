import { TWorkspace } from './Workspace';

export type TUserRole = 'Owner' | 'Admin' | 'Employee';

export type TUser = {
  id: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  workspaceId?: string;
  workspace?: TWorkspace;
  role?: TUserRole;
};


export type TUserLogin = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
