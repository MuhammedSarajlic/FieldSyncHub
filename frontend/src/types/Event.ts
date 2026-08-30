import { TEmployee } from './Employee';
import { TAddRecurrenceRule, TRecurrenceRule } from './RecurrenceRule';

export type TEvent = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  category: string;
  location?: string;
  customerId?: string;
  // assignedToIds: string[];
  assignedTo: TEmployee[];
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRuleId?: string;
  recurrenceRule?: TRecurrenceRule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type TAddEvent = {
  workspaceId: string;
  title: string;
  description?: string;
  category: string;
  location?: string;
  customerId?: string;
  assignedToIds: string[];
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRuleId: string | null;
  recurrenceRule?: TAddRecurrenceRule;
  createdBy?: string;
};

export type TUpdateEvent = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  category: string;
  location?: string;
  customerId?: string;
  assignedToIds: string[];
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRuleId?: string;
  recurrenceRule?: TAddRecurrenceRule;
};
