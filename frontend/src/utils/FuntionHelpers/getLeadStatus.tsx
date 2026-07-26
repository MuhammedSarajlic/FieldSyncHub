import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  FileText,
} from 'lucide-react';
import { LeadStatus } from '../../constants/Enumeration/LeadEnum/LeadEnum';

export const getLeadStatus = (status: LeadStatus) => {
  switch (status) {
    case LeadStatus.Pending:
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className='w-4 h-4 mr-1.5' />,
      };
    case LeadStatus.Reviewed:
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Eye className='w-4 h-4 mr-1.5' />,
      };
    case LeadStatus.Approved:
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className='w-4 h-4 mr-1.5' />,
      };
    case LeadStatus.Declined:
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className='w-4 h-4 mr-1.5' />,
      };
    case LeadStatus.Converted:
      return {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: <ArrowRightCircle className='w-4 h-4 mr-1.5' />,
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border border-gray-100',
        icon: <FileText className='w-4 h-4 mr-1.5' />,
      };
  }
};
