import {
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Briefcase,
  Hourglass,
  ClipboardCheck,
  Send,
} from 'lucide-react';
import { QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';

export const getQuoteStatus = (status: QuoteStatus) => {
  switch (status) {
    case QuoteStatus.Draft:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <FileText className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.Sent:
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Send className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.AwaitingResponse:
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.AwaitingApproval:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <ClipboardCheck className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.Approved:
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.Declined:
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.Expired:
      return {
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: <Hourglass className='w-4 h-4 mr-1.5' />,
      };
    case QuoteStatus.ConvertedToJob:
      return {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: <Briefcase className='w-4 h-4 mr-1.5' />,
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border border-gray-100',
        icon: <FileText className='w-4 h-4 mr-1.5' />,
      };
  }
};
