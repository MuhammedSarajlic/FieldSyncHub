import { CompanySize } from '../constants/Enumeration/WorkspaceEnum/WorkspaceEnum';
import { TUser, TUserLookup } from './User';

export type TWorkspace = {
  id: string;
  name: string;
  companyName?: string;
  companyUrl?: string;
  phoneNumber?: string;
  currency: string;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  taxRegistrationNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  size: CompanySize;
  createdByUserId: string;
  createdByUser?: TUser;
  logoUrl?: string;
  theme: string;
  category: string;
  users: TUser[];
  createdAt: string;
  updatedAt: string;
};

export type TGetWorkspace = {
  id: string;
  name: string;
  companyName?: string;
  companyUrl?: string;
  phoneNumber?: string;
  currency: string;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  taxRegistrationNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  size: CompanySize;
  createdByUser?: TUserLookup;
  logoUrl?: string;
  theme: string;
  category: string;
  users: TUserLookup[];
  createdAt: string;
  updatedAt: string;
};

export type TAddWorkspace = {
  name: string;
  companyName?: string;
  companyUrl?: string;
  phoneNumber?: string;
  currency: string;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  taxRegistrationNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  size: CompanySize;
  createdByUserId: string;
  logoUrl?: string;
  theme: string;
  category: string;
};

export type TUpdateWorkspace = {
  id: string;
  name?: string;
  companyName?: string;
  companyUrl?: string;
  phoneNumber?: string;
  currency?: string;
  defaultTaxRate?: number;
  defaultPaymentTerms?: string;
  taxRegistrationNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  size?: CompanySize;
  logoUrl?: string;
  theme?: string;
  category?: string;
};

export type TWorkspaceLookup = {
  id: string;
  name: string;
};
