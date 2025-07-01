import {
  JobStatus,
  PaymentStatus,
} from '../../../../../constants/Enumeration/JobEnum/JobEnum';
import { TJob } from '../../../../../types/Job';
import { formatCurrency } from '../../../../../utils/FuntionHelpers/formatCurrency';
import { formatDate } from '../../../../../utils/FuntionHelpers/formatDate';
import { formatTime } from '../../../../../utils/FuntionHelpers/formatTime';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import { getPaymentStatusColor } from '../../../../../utils/FuntionHelpers/JobUtils/getPaymentStatusColor';
import { useNavigate } from 'react-router';
import { getJobStatus } from '../../../../../utils/FuntionHelpers/JobUtils/getJobStatus';
import { DateTime } from 'luxon';

interface ICustomerDetailsJobItem {
  job: TJob;
}

const JobTabItem = ({ job }: ICustomerDetailsJobItem) => {
  const navigate = useNavigate();
  const localTime = DateTime.fromISO(job.startTime, { zone: 'utc' }).toLocal();
  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className='group flex flex-col sm:flex-row items-start justify-between gap-4 p-4  hover:bg-gray-50 transition-colors cursor-pointer'
    >
      {/* Left Section: Job Number, Title, and Priority */}
      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-center gap-3'>
          <h3 className='text-base font-semibold text-gray-900 truncate'>
            {job.title || 'Untitled Job'}
          </h3>
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              getJobStatus(job.status).color
            }`}
          >
            {JobStatus[job.status]}
          </div>
        </div>

        {/* Location - Only if available */}
        {job.property?.address && (
          <div className='flex items-center gap-1 text-sm text-gray-600 truncate'>
            <MapPin className='h-4 w-4 flex-shrink-0 text-gray-400' />
            <span>{job.property.address}</span>
          </div>
        )}
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
              <span>{formatTime(localTime.toJSDate())}</span>
            </>
          )}
        </div>

        {/* Total Amount */}
        <div className='mt-3 flex items-center justify-end space-x-2'>
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(
              job.paymentStatus
            )}`}
          >
            {PaymentStatus[job.paymentStatus] == 'Partial'
              ? 'Partially paid'
              : PaymentStatus[job.paymentStatus]}
          </div>
          <div className='font-semibold'>{formatCurrency(job.totalAmount)}</div>
        </div>
      </div>
    </div>
  );
};

export default JobTabItem;
