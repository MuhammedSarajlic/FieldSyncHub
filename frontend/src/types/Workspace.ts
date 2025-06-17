import { TUser } from './User';

export type TWorkspaceSize = 'Solo' | 'Small' | 'Medium' | 'Large';

export type TWorkspace = {
  id: string;
  name: string;
  companyName?: string;
  companyUrl?: string;
  phoneNumber?: string;
  size: TWorkspaceSize;
  createdByUserId: string;
  logoUrl?: string;
  theme: string;
  category: string;
  users: TUser[];
};

export type TAddWorkspace = {
  name: string;
  companyName?: string;
  companyUrl?: string;
  phoneNumber?: string;
  size: TWorkspaceSize;
  createdByUserId: string;
  logoUrl?: string;
  theme: string;
  category: string;
};
