import { TEvent } from './Event';
import { TJob } from './Job';
import { TLead } from './Lead';

export type TCalendarEvents = {
  events: TEvent[];
  jobs: TJob[];
  leads: TLead[];
};
