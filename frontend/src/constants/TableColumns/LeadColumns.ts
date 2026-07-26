import { TTableColumns } from '../../types/Table';
import { TLead } from '../../types/Lead';
import { getLeadStatus } from '../../utils/FuntionHelpers/getLeadStatus';
import { getJobPriority } from '../../utils/FuntionHelpers/JobUtils/getJobPriority';
import { LeadStatus, LeadPriority } from '../Enumeration/LeadEnum/LeadEnum';

export const leadColumns: TTableColumns = [
  {
    header: 'Customer',
    accessor: (lead: TLead) => lead.customer?.fullName ?? 'N/A',
    type: 'text',
    bold: true,
  },
  {
    header: 'Description',
    accessor: 'description',
    type: 'text',
  },
  {
    header: 'Status',
    accessor: 'status',
    type: 'status',
    statusConfig: (value: string | number) => getLeadStatus(Number(value)),
    enumMap: LeadStatus,
  },
  {
    header: 'Priority',
    accessor: 'priority',
    type: 'priority',
    priorityConfig: (value: string | number) => getJobPriority(Number(value)),
    enumMap: LeadPriority,
  },
  {
    header: 'Created',
    accessor: 'createdAt',
    type: 'date',
  },
];
