import { EmployeeStatus } from '../constants/Enumeration/EmployeeEnum/EmployeeEnum';
import { TUser } from './User';
import { TWorkspace } from './Workspace';

export type TEmployee = {
  id: string;
  userId: string;
  user: TUser;
  workspaceId: string;
  workspace?: TWorkspace;
  position?: string;
  department?: string;
  status: EmployeeStatus;
  hireDate: string;
  phoneNumber?: string;
  imageUrl?: string;
  location?: string;
  isAvailable: boolean;
  hourlyCostRate: number;
  billableRate: number;
  skills: string[];
  certifications: string[];
  workingDays: number[];
  workdayStart?: string;
  workdayEnd?: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddEmployee = {
  userId: string;
  workspaceId: string;
  position?: string;
  department?: string;
  status: EmployeeStatus;
  hireDate: string;
  phoneNumber?: string;
  imageUrl?: string;
  location?: string;
  isAvailable: boolean;
  hourlyCostRate?: number;
  billableRate?: number;
  skills?: string[];
  certifications?: string[];
  workingDays?: number[];
  workdayStart?: string;
  workdayEnd?: string;
};

export type TUpdateEmployee = {
  id: string;
  position?: string;
  department?: string;
  status?: EmployeeStatus;
  hireDate?: string;
  phoneNumber?: string;
  imageUrl?: string;
  location?: string;
  isAvailable?: boolean;
  hourlyCostRate?: number;
  billableRate?: number;
  skills?: string[];
  certifications?: string[];
  workingDays?: number[];
  workdayStart?: string;
  workdayEnd?: string;
};

export type TEmployeeFilter = {
  q?: string;
  sortBy?: string;
  sort?: string;
  workspaceId?: string;
  position?: string;
  department?: string;
  status?: string;
  hireDateMin?: string;
  hireDateMax?: string;
};

export type TUpdateEmployeeError = {
  position?: string;
  department?: string;
  hireDate?: string;
};

export type TEmployeeStats = {
  totalEmployees: number;
  activeEmployees: number;
  availableEmployees: number;
  newHiresThisMonth: number;
};
