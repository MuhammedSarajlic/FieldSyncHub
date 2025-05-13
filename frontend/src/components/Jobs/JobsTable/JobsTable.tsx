import { TJob } from '../../../types/Job';
import JobsTableBody from './JobsTableBody';
import JobsTableHeader from './JobsTableHeader';
import JobsTablePagination from './JobsTablePagination';

interface IJobsTable {
  jobs: TJob[];
}

const JobsTable = ({ jobs }: IJobsTable) => {
  return (
    <div
      className={`w-full overflow-hidden bg-white rounded-lg shadow-sm border-[1px] border-border-primary`}
    >
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <JobsTableHeader />
          <JobsTableBody jobs={jobs} />
        </table>
      </div>

      <JobsTablePagination listLength={jobs.length} />
    </div>
  );
};

export default JobsTable;
