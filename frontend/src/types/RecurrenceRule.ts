import {
  DayOfWeek,
  RecurrenceEndType,
  RecurrenceFrequency,
} from '../constants/Enumeration/RecurrenceRuleEnum/RecurrenceRuleEnum';

export type TRecurrenceRule = {
  id: string;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: DayOfWeek[];
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeekInMonth?: DayOfWeek | null;
  monthOfYear?: number | null;
  endType: RecurrenceEndType;
  occurrenceCount?: number | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TAddRecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: DayOfWeek[];
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeekInMonth?: DayOfWeek | null;
  monthOfYear?: number | null;
  endType: RecurrenceEndType;
  occurrenceCount?: number | null;
  endDate?: string | null;
};

export type TUpdateRecurrenceRule = {
  id: string;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: DayOfWeek[];
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeekInMonth?: DayOfWeek | null;
  monthOfYear?: number | null;
  endType: RecurrenceEndType;
  occurrenceCount?: number | null;
  endDate?: string | null;
};
