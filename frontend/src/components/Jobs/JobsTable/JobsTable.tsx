import JobsTableBody from './JobsTableBody';
import JobsTableHeader from './JobsTableHeader';
import JobsTablePagination from './JobsTablePagination';

const JobsTable = ({ filteredJobs }) => {
  return (
    <div
      className={`w-full overflow-hidden bg-white rounded-lg shadow-sm border-[1px] border-border-primary`}
    >
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <JobsTableHeader />
          <JobsTableBody filteredJobs={filteredJobs} />
        </table>
      </div>

      <JobsTablePagination filteredJobs={filteredJobs} />
    </div>
  );
};

export default JobsTable;
