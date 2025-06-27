import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { InvoiceStatus } from '../../constants/Enumeration/InvoiceEnum/InvoiceEnum';

export const getInvoiceStatus = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.Paid:
      return {
        color: 'bg-green-50 text-green-700 border-green-100',
        icon: <CheckCircle className='w-4 h-4 mr-1.5 text-green-500' />,
      };
    case InvoiceStatus.Sent:
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-100',
        icon: <Clock className='w-4 h-4 mr-1.5 text-blue-500' />,
      };
    case InvoiceStatus.Overdue:
      return {
        color: 'bg-red-50 text-red-700 border-red-100',
        icon: <AlertCircle className='w-4 h-4 mr-1.5 text-red-500' />,
      };
    case InvoiceStatus.Draft:
      return {
        color: 'bg-gray-50 text-gray-700 border-gray-100',
        icon: <FileText className='w-4 h-4 mr-1.5 text-gray-500' />,
      };
    default:
      return {
        color: 'bg-gray-50 text-gray-700 border-gray-100',
        icon: <FileText className='w-4 h-4 mr-1.5 text-gray-500' />,
      };
  }
};
