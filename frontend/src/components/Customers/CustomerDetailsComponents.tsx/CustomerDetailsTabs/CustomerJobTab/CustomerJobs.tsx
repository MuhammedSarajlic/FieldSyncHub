import { Loader2 } from 'lucide-react';
import { TCustomerTab } from '../../../../../types/Customer';
import { TJob } from '../../../../../types/Job';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsJobItem from './CustomerDetailsJobItem';

interface ICustomerJobsProps {
  jobs: TJob[];
  tab: TCustomerTab;
}

const CustomerJobs = ({ jobs, tab }: ICustomerJobsProps) => {
  if (tab.loading)
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='animate-spin mr-2 h-5 w-5 text-gray-400' />
        <span className='text-gray-500 text-sm'>
          Loading {tab.label.toLowerCase()}…
        </span>
      </div>
    );

  return jobs.length > 0 ? (
    <div className='divide-y divide-gray-100'>
      {jobs.map((job) => (
        <CustomerDetailsJobItem key={job.jobId} job={job} />
      ))}
    </div>
  ) : (
    <EmptyTabTable tab={tab} onButtonClick={() => console.log('Add new job')} />
  );
};

export default CustomerJobs;
