import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export const getInvoiceStatus = (status: string) => {
  switch (status) {
    case 'paid':
      return {
        color: 'bg-green-50 text-green-700 border-green-100',
        icon: <CheckCircle className='w-4 h-4 text-green-500' />,
      };
    case 'sent':
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-100',
        icon: <Clock className='w-4 h-4 text-blue-500' />,
      };
    case 'overdue':
      return {
        color: 'bg-red-50 text-red-700 border-red-100',
        icon: <AlertCircle className='w-4 h-4 text-red-500' />,
      };
    case 'draft':
      return {
        color: 'bg-gray-50 text-gray-700 border-gray-100',
        icon: <FileText className='w-4 h-4 text-gray-500' />,
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border-gray-100',
        icon: <FileText className='w-4 h-4 text-gray-500' />,
      };
  }
};
