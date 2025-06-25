import { TJob } from '../../types/Job';
import { TTableColumns } from '../../types/Table';
import { getJobPriority } from '../../utils/FuntionHelpers/JobUtils/getJobPriority';
import { getJobStatus } from '../../utils/FuntionHelpers/JobUtils/getJobStatus';
import { JobPriority, JobStatus } from '../Enumeration/JobEnum/JobEnum';

export const jobColumns: TTableColumns = [
  {
    header: 'Customer',
    accessor: (job: TJob) => job.customer?.fullName ?? '-',
    type: 'text',
    bold: true,
  },
  {
    header: 'Property',
    accessor: (job: TJob) => job.property?.address,
    type: 'text',
  },
  {
    header: 'Schedule',
    accessor: 'startDate',
    type: 'date',
  },
  {
    header: 'Status',
    accessor: 'status',
    type: 'status',
    statusConfig: (value: string | number) => getJobStatus(Number(value)),
    enumMap: JobStatus,
  },
  {
    header: 'Priority',
    accessor: 'priority',
    type: 'priority',
    priorityConfig: (value: string | number) => getJobPriority(Number(value)),
    enumMap: JobPriority,
  },
  {
    header: 'Value',
    accessor: 'totalAmount',
    type: 'currency',
    align: 'right',
    bold: true,
  },
];
