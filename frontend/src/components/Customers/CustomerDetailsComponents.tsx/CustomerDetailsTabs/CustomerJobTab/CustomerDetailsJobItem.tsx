import { TJob } from '../../../../../types/Job';
import { formatCurrency } from '../../../../../utils/FuntionHelpers/formatCurrency';
import { formatDate } from '../../../../../utils/FuntionHelpers/formatDate';
import { formatTime } from '../../../../../utils/FuntionHelpers/formatTime';
import { Clock, MapPin, CalendarDays } from 'lucide-react';

interface ICustomerDetailsJobItem {
  job: TJob;
}

const CustomerDetailsJobItem = ({ job }: ICustomerDetailsJobItem) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 ring-green-500/10';
      case 'cancelled':
        return 'bg-red-100 text-red-800 ring-red-500/10';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 ring-blue-500/10';
      case 'in progress':
        return 'bg-amber-100 text-amber-800 ring-amber-500/10';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-500/10';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'partial':
        return 'text-amber-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className='group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer'>
      {/* Left Section: Job Number, Title, and Priority */}
      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-center gap-2'>
          <h3 className='text-base font-semibold text-gray-900 truncate'>
            {job.title || 'Untitled Job'}
          </h3>
          <span className='text-sm font-medium text-gray-500'>
            #{job.jobNumber || job.jobId.slice(0, 5).toUpperCase()}
          </span>
        </div>

        {/* Location - Only if available */}
        {job.property?.address && (
          <div className='flex items-center gap-1 text-sm text-gray-600 truncate'>
            <MapPin className='h-4 w-4 flex-shrink-0 text-gray-400' />
            <span>{job.property.address}</span>
          </div>
        )}

        {/* Status and Type Badges */}
        <div className='flex flex-wrap items-center gap-2 mt-2'>
          {job.status && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusClasses(
                job.status
              )}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  job.status === 'completed'
                    ? 'bg-green-500'
                    : job.status === 'cancelled'
                    ? 'bg-red-500'
                    : job.status === 'in progress'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              ></span>
              {job.status.slice(0, 1).toUpperCase() +
                job.status.replace('_', ' ').slice(1)}
            </span>
          )}
          {job.priority && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full capitalize ${getPriorityColor(
                job.priority
              )}`}
            >
              {job.priority}
            </span>
          )}
          {job.jobType === 'recurring' && (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ring-purple-500/10 ring-1 ring-inset'>
              Recurring
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Date, Time Window, and Amount */}
      <div className='flex-shrink-0 text-right space-y-1 sm:ml-auto'>
        {/* Date and Time */}
        <div className='flex items-center justify-end gap-1 text-sm font-medium text-gray-900'>
          <CalendarDays className='h-4 w-4 text-gray-500' />
          <span>{formatDate(job.startDate)}</span>
          {job.startTime && (
            <>
              <span className='text-gray-400 mx-1'>•</span>
              <Clock className='h-4 w-4 text-gray-500' />
              <span>{formatTime(job.startTime)}</span>
            </>
          )}
        </div>

        {job.arrivalWindowStart && (
          <p className='text-xs text-gray-600'>
            Window: {formatTime(job.arrivalWindowStart)} -{' '}
            {formatTime(job.arrivalWindowEnd)}
          </p>
        )}

        {/* Total Amount */}
        <div className='mt-2'>
          <p
            className={`text-base font-bold ${getPaymentStatusColor(
              job.paymentStatus
            )}`}
          >
            {formatCurrency(job.totalAmount)}
            {job.paymentStatus !== 'paid' && (
              <span className='block text-xs font-normal text-gray-500'>
                ({job.paymentStatus.replace('_', ' ')})
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsJobItem;
