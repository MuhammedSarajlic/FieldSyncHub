import { TWorkspace } from './Workspace';

export type TUser = {
  id: string;
  email: string;
  passwordHash: string;
  googleId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  workspace: TWorkspace;
  role: number;
};

export type TUserLogin = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
