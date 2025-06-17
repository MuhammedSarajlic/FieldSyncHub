import { TCustomer } from './Customer';
import { TAddLineItem, TLineItem } from './LineItem';
import { TNote } from './Note';
import { TProperty } from './Property';
import { TStatusHistory } from './StatusHistory';
import { TEmployee } from './Employee';
import { TDiscountType } from './Invoice';

export type TJobType = 'OneTime' | 'Recurring';

export type TJobStatus = 'Scheduled' | 'Dispatched' | 'InProgress' | 'Completed' | 'Cancelled';

export type TJobPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TPaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';

export type TJob = {
  jobId: string;
  workspaceId: string;
  title: string;
  description?: string;
  customerId: string;
  customer?: TCustomer;
  propertyId?: string;
  property?: TProperty;
  jobType: TJobType;
  repeats: string;
  lineItems: TLineItem[];
  status: TJobStatus;
  statusHistory: TStatusHistory[];
  priority: TJobPriority;
  startDate: string;
  startTime: string;
  arrivalWindowStart?: string;
  arrivalWindowEnd?: string;
  duration?: number;
  estimatedDurationMinutes: number;
  timeZone: string;
  assignedTeamMembers: TEmployee[];
  teamNotes?: TNote[];
  paymentStatus: TPaymentStatus;
  depositAmount: number;
  subtotal: number;
  taxAmount: number;
  discountType: TDiscountType; 
  discountAmount: number;
  calculatedDiscount: number;
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
  internalNotes?: TNote[];
  createdAt: string;
  updatedAt: string;
};



export type TAddJob = {
  workspaceId: string;
  title: string;
  description?: string;
  customerId: string;
  propertyId?: string;
  jobType: TJobType;
  repeats: string;
  lineItems: TAddLineItem[];
  statusHistory: any[]; 
  priority: TJobPriority;
  startDate: string;
  startTime: string;
  arrivalWindowStart?: string;
  arrivalWindowEnd?: string;
  duration?: number;
  estimatedDurationMinutes: number;
  timeZone: string;
  assignedTeamMembers: TEmployee[];
  teamNotes?: TNote[];
  paymentStatus: TPaymentStatus;
  depositAmount: number;
  taxAmount: number;
  discountType: TDiscountType; 
  discountAmount: number;
  sendInvoice: boolean;
  sendReminder: boolean;
  reminderDaysBefore: number;
  confirmationSent: boolean;
  reminderSent: boolean;
  invoiceSent: boolean;
  createdBy: string;
  source?: string;
};