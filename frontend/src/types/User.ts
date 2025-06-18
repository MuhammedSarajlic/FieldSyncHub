import { TWorkspace, TWorkspaceLookup } from './Workspace';

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
  role: TUserRole;
  createdAt: string;
  updatedAt: string;
};

export type TGetUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: TUserRole;
  workspace?: TWorkspaceLookup;
  createdAt: string;
  updatedAt: string;
};

export type TUpdateUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: TUserRole;
};

export type TUserLogin = {
  email: string;
  password: string;
};

export type TUserRegister = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type TUserLookup = {
  email: string;
  fullName: string;
};
