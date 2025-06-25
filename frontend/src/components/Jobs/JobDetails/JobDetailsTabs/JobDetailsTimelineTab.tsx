import { formatDate } from '../../../../utils/FuntionHelpers/formatDate';
import { CheckCircle } from 'lucide-react';
import { TJob } from '../../../../types/Job';

interface IJobDetailsTimelineTab {
  jobDetails: TJob;
}

const JobDetailsTimelineTab = ({ jobDetails }: IJobDetailsTimelineTab) => {
  const statusHistory = [
    {
      id: 'sh-001',
      fromStatus: 'Scheduled',
      toStatus: 'Dispatched',
      changedAt: '2024-06-20T08:00:00Z',
      changedBy: 'Michael Chen',
      notes: 'Team dispatched to location',
      jobId: 'job-001',
    },
    {
      id: 'sh-002',
      fromStatus: 'Dispatched',
      toStatus: 'InProgress',
      changedAt: '2024-06-20T09:30:00Z',
      changedBy: 'Michael Chen',
      notes: 'Work started on schedule',
      jobId: 'job-001',
    },
  ];
  return (
    <div>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>
        Status History
      </h3>
      <div className='space-y-4'>
        {statusHistory.map((change) => (
          <div key={change.id} className='flex items-start'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                <CheckCircle className='w-4 h-4 text-blue-600' />
              </div>
            </div>
            <div className='ml-4'>
              <div className='flex items-center space-x-2'>
                <p className='text-sm font-medium text-gray-900'>
                  Status changed from{' '}
                  <span className='text-blue-600'>{change.fromStatus}</span> to{' '}
                  <span className='text-blue-600'>{change.toStatus}</span>
                </p>
              </div>
              <p className='text-sm text-gray-600 mt-1'>{change.notes}</p>
              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                <span>{formatDate(change.changedAt)}</span>
                <span>by {change.changedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobDetailsTimelineTab;
