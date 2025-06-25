import { Calendar, Clock, Tag } from 'lucide-react';
import { formatDate } from '../../../../utils/FuntionHelpers/formatDate';
import { formatTime } from '../../../../utils/FuntionHelpers/formatTime';
import { TJob } from '../../../../types/Job';

interface IJobDetailsOverviewTab {
  jobDetails: TJob;
}

const JobDetailsOverviewTab = ({ jobDetails }: IJobDetailsOverviewTab) => {
  return (
    <div className='space-y-8'>
      {/* Job Description */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Job Description
        </h3>
        <p className='text-gray-700 leading-relaxed'>
          {jobDetails.description}
        </p>
      </div>

      {/* Schedule Information */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Schedule</h3>
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='flex items-center'>
            <Calendar className='w-5 h-5 text-gray-400 mr-3' />
            <div>
              <p className='text-sm font-medium text-gray-600'>Start Date</p>
              <p className='text-gray-900'>
                {formatDate(jobDetails.startDate)}
              </p>
            </div>
          </div>
          <div className='flex items-center'>
            <Clock className='w-5 h-5 text-gray-400 mr-3' />
            <div>
              <p className='text-sm font-medium text-gray-600'>Time Window</p>
              <p className='text-gray-900'>
                {formatTime(jobDetails.arrivalWindowStart)} -{' '}
                {formatTime(jobDetails.arrivalWindowEnd)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {jobDetails.tags.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Tags</h3>
          <div className='flex flex-wrap gap-2'>
            {jobDetails.tags.map((tag, index) => (
              <span
                key={index}
                className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
              >
                <Tag className='w-3 h-3 mr-2' />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className='grid md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Customer Notes
          </h3>
          <div className='bg-blue-50 rounded-lg p-4'>
            <p className='text-gray-700'>{jobDetails.customerNotes}</p>
          </div>
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Internal Notes
          </h3>
          <div className='bg-yellow-50 rounded-lg p-4'>
            <p className='text-gray-700'>{jobDetails.internalNotes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsOverviewTab;
