import { Briefcase, ClipboardList, FileText, Receipt } from 'lucide-react';
import { TCustomerDetailsStats, TCustomerTab } from '../../../types/Customer';
import { TInvoice } from '../../../types/Invoice';
import { TJob } from '../../../types/Job';
import { TQuote } from '../../../types/Quote';
import { TRequest } from '../../../types/Lead';

export const customerStatsInitialState: TCustomerDetailsStats = {
  totalJobs: 0,
  totalQuotes: 0,
  totalInvoiced: 0,
  invoicesCount: 0,
  lastActivity: '',
};

export const customerTabsInitialState: TCustomerTab[] = [
  {
    id: 'jobs',
    label: 'Jobs',
    count: 0,
    loaded: false,
    loading: false,
    items: [] as TJob[],
    icon: Briefcase,
  },
  {
    id: 'leads',
    label: 'Leads',
    count: 0,
    loaded: false,
    loading: false,
    items: [] as TRequest[],
    icon: ClipboardList,
  },
  {
    id: 'quotes',
    label: 'Quotes',
    count: 0,
    loaded: false,
    loading: false,
    items: [] as TQuote[],
    icon: FileText,
  },
  {
    id: 'invoices',
    label: 'Invoices',
    count: 0,
    loaded: false,
    loading: false,
    items: [] as TInvoice[],
    icon: Receipt,
  },
];
