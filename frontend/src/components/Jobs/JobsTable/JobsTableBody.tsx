import { TJob } from '../../../types/Job';

interface IJobsTableBody {
  jobs: TJob[];
}

const JobsTableBody = ({ jobs }: IJobsTableBody) => {
  // Get status color "scheduled", "dispatched", "in_progress", "completed", "canceled"
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'dispatched':
        return 'bg-amber-100 text-amber-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color "low", "normal", "high", "urgent"
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tbody className='bg-white divide-y divide-gray-200'>
      {jobs.length > 0 &&
        jobs.map((job) => (
          <tr
            key={job.jobId}
            className={`hover:bg-gray-50 cursor-pointer min-h-[163px]`}
          >
            <td className='px-4 py-5 whitespace-nowrap'>
              <div className='flex items-center'>
                <div className='text-sm font-medium text-gray-900'>
                  {job.customer.firstName} {job.customer.lastName}
                </div>
              </div>
            </td>
            <td className='px-4 py-5 whitespace-nowrap text-sm'>
              {job.property.street}
            </td>
            <td className='px-4 py-5 whitespace-nowrap'>
              <div className='text-sm text-gray-900'>{job.startDate}</div>
            </td>
            <td className='px-4 py-5 whitespace-nowrap'>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  job.status
                )}`}
              >
                {job.status}
              </span>
            </td>
            <td className='px-4 py-5 whitespace-nowrap'>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                  job.priority
                )}`}
              >
                {job.priority}
              </span>
            </td>

            <td className='px-4 py-5 whitespace-nowrap text-right text-sm font-medium'>
              {job.totalAmount}
            </td>
          </tr>
        ))}
      {jobs.length === 0 && (
        <tr>
          <td colSpan={6} className='px-4 py-8 text-center text-gray-500'>
            No jobs found matching your criteria
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default JobsTableBody;
