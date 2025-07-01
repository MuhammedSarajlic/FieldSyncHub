import {
  CheckCircle2,
  XCircle,
  Briefcase,
  Calendar,
  Hourglass,
  Truck,
} from 'lucide-react';
import { JobStatus } from '../../../constants/Enumeration/JobEnum/JobEnum';

export const getJobStatus = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Scheduled:
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Calendar className='w-4 h-4 mr-1.5' />,
      };
    case JobStatus.Dispatched:
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Truck className='w-4 h-4 mr-1.5' />,
      };
    case JobStatus.InProgress:
      return {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: <Hourglass className='w-4 h-4 mr-1.5' />,
      };
    case JobStatus.Completed:
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className='w-4 h-4 mr-1.5' />,
      };
    case JobStatus.Cancelled:
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className='w-4 h-4 mr-1.5' />,
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border border-gray-100',
        icon: <Briefcase className='w-4 h-4 mr-1.5' />,
      };
  }
};
