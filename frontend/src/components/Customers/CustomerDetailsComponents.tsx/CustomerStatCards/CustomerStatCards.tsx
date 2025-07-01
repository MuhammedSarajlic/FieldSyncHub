import { Briefcase, CalendarClock, FileText, Receipt } from 'lucide-react';
import { formatDate } from '../../../../utils/FuntionHelpers/formatDate';
import { TCustomerDetailsStats } from '../../../../types/Customer';
import { formatCurrency } from '../../../../utils/FuntionHelpers/formatCurrency';
import { DateTime } from 'luxon';

interface ICustomerStatCards {
  customerStats: TCustomerDetailsStats;
}

const CustomerStatCards = ({ customerStats }: ICustomerStatCards) => {
  const localDate = DateTime.fromISO(customerStats.lastActivity, {
    zone: 'utc',
  }).toLocal();
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {/* Total Jobs */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='p-2 bg-green-100 rounded-lg'>
            <Briefcase className='w-5 h-5 text-green-600' />
          </div>
          <h3 className='text-sm font-medium text-gray-600'>Total Jobs</h3>
        </div>
        <p className='text-2xl font-bold text-gray-900 mb-1'>
          {customerStats.totalJobs}
        </p>
        <p className='text-sm text-gray-500'>Completed or active jobs</p>
      </div>
      {/* Total Quotes */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <FileText className='w-5 h-5 text-blue-600' />
          </div>
          <h3 className='text-sm font-medium text-gray-600'>Total Quotes</h3>
        </div>
        <p className='text-2xl font-bold text-gray-900 mb-1'>
          {customerStats.totalQuotes}
        </p>
        <p className='text-sm text-gray-500'>Issued quotes</p>
      </div>

      {/* Invoices / Total Spent */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='p-2 bg-purple-100 rounded-lg'>
            <Receipt className='w-5 h-5 text-purple-600' />
          </div>
          <h3 className='text-sm font-medium text-gray-600'>Total Invoiced</h3>
        </div>
        <p className='text-2xl font-bold text-gray-900 mb-1'>
          {formatCurrency(customerStats.totalInvoiced)}
        </p>
        <p className='text-sm text-gray-500'>
          From {customerStats.invoicesCount} invoice
          {customerStats.invoicesCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Last Activity */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='p-2 bg-yellow-100 rounded-lg'>
            <CalendarClock className='w-5 h-5 text-yellow-600' />
          </div>
          <h3 className='text-sm font-medium text-gray-600'>Last Activity</h3>
        </div>
        <p className='text-2xl font-bold text-gray-900 mb-1'>
          {formatDate(localDate.toJSDate())}
        </p>
        <p className='text-sm text-gray-500'>Most recent interaction</p>
      </div>
    </div>
  );
};

export default CustomerStatCards;
