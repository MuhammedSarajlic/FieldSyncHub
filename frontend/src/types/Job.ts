import { TCustomer } from './Customer';
import { TAddLineItem, TLineItem, TUpdateLineItem } from './LineItem';
import { TProperty } from './Property';
import { TEmployee } from './Employee';
import {
  JobPriority,
  JobStatus,
  JobType,
  PaymentStatus,
} from '../constants/Enumeration/JobEnum/JobEnum';
import { TStatusChange } from './StatusHistory';
import { DiscountType } from '../constants/Enumeration/CommonEnum/DiscountEnum';

export type TJob = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  customerId: string;
  customer?: TCustomer;
  propertyId?: string;
  property?: TProperty;
  jobType: JobType;
  repeats: string;
  lineItems: TLineItem[];
  status: JobStatus;
  statusHistory: TStatusChange[];
  priority: JobPriority;
  startDate: string;
  startTime: string;
  arrivalWindow?: number;
  duration?: number;
  timeZone: string;
  estimatedDurationMinutes: number;
  assignedTeamMembers: TEmployee[];
  paymentStatus: PaymentStatus;
  depositAmount: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  sendInvoice: boolean;
  sendReminder: boolean;
  reminderDaysBefore: number;
  confirmationSent: boolean;
  reminderSent: boolean;
  invoiceSent: boolean;
  jobNumber: string;
  completedAt?: string;
  createdBy: string;
  source?: string;
  tags: string[];
  customerNotes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddJob = {
  workspaceId: string;
  title: string;
  description?: string;
  customerId: string;
  propertyId?: string;
  jobType: JobType;
  repeats: string;
  lineItems: TAddLineItem[];
  status: JobStatus;
  statusHistory: TStatusChange[];
  priority: JobPriority;
  startDate: string;
  startTime: string;
  arrivalWindow?: number;
  duration?: number;
  timeZone: string;
  estimatedDurationMinutes: number;
  assignedTeamMembers: TEmployee[];
  paymentStatus: PaymentStatus;
  depositAmount: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  sendInvoice: boolean;
  sendReminder: boolean;
  reminderDaysBefore: number;
  confirmationSent: boolean;
  reminderSent: boolean;
  invoiceSent: boolean;
  createdBy: string;
  source?: string;
  tags?: string[];
  customerNotes?: string;
  internalNotes?: string;
};

export type TUpdateJob = {
  id: string;
  title?: string;
  description?: string;
  propertyId?: string;
  jobType?: JobType;
  repeats?: string;
  lineItems?: TUpdateLineItem[];
  priority?: JobPriority;
  startDate?: string;
  startTime?: string;
  arrivalWindow?: number;
  duration?: number;
  estimatedDurationMinutes?: number;
  assignedTeamMembers?: TEmployee[];
  depositAmount?: number;
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number;
  sendInvoice?: boolean;
  sendReminder?: boolean;
  reminderDaysBefore?: number;
  confirmationSent?: boolean;
  reminderSent?: boolean;
  invoiceSent?: boolean;
  source?: string;
  tags?: string[];
  customerNotes?: string;
  internalNotes?: string;
};

export type JobFilter = {
  q?: string;
  sortBy?: string;
  sort?: string;
  scheduleDateMin?: string;
  scheduleDateMax?: string;
  totalMin?: number;
  totalMax?: number;
  priority?: string;
  status?: string;
};

export type TJobStats = {
  totalJobs: number;
  completedJobs: number;
  scheduledJobs: number;
  totalValue: number;
};
