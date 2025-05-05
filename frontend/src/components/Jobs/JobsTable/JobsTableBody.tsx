const JobsTableBody = ({ filteredJobs }) => {
  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color class
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <tbody className='bg-white divide-y divide-gray-200'>
      {filteredJobs.map((job) => (
        <tr
          key={job.id}
          className={`hover:bg-gray-50 cursor-pointer min-h-[163px]`}
        >
          <td className='px-4 py-5 whitespace-nowrap'>
            <div className='flex items-center'>
              <div className='text-sm font-medium text-gray-900'>
                {job.customer}
              </div>
            </div>
          </td>
          <td className='px-4 py-5 whitespace-nowrap text-sm'>{job.address}</td>
          <td className='px-4 py-5 whitespace-nowrap'>
            <div className='text-sm text-gray-900'>{job.date}</div>
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
            {job.value}
          </td>
        </tr>
      ))}
      {filteredJobs.length === 0 && (
        <tr>
          <td colSpan='6' className='px-4 py-8 text-center text-gray-500'>
            No jobs found matching your criteria
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default JobsTableBody;
