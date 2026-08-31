import { UserRole } from '../constants/Enumeration/UserEnum/UserEnum';
import { TWorkspace, TWorkspaceLookup } from './Workspace';

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
  workspaces?: { id: string; name: string; role: UserRole }[];
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type TGetUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  workspace?: TWorkspaceLookup;
  workspaces?: { id: string; name: string; role: UserRole }[];
  createdAt: string;
  updatedAt: string;
};

export type TUpdateUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
};

export type TUserLogin = {
  email: string;
  password: string;
  rememberMe: boolean;
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
