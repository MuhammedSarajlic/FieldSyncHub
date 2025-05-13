import { TUser } from './User';

export type TWorkspace = {
  id: string;
  name: string;
  createdBy: string;
  logoUrl: string;
  theme: string;
  category: string;
  users: TUser[];
};

export type TAddWorkspace = {
  name: string;
  createdBy: string;
  logoUrl: string;
  theme: string;
  category: string;
  users: TUser[];
};
