import { TCustomerTab } from '../../../../../types/Customer';
import { TJob } from '../../../../../types/Job';
import EmptyTabTable from '../EmptyTabTable';
import JobTabItem from './JobTabItem';
import { useNavigate } from 'react-router';
import TabTableLoader from '../../../../CustomElements/Loaders/TabTableLoader';

interface ICustomerJobsProps {
  jobs: TJob[];
  tab: TCustomerTab;
}

const JobTabTableList = ({ jobs, tab }: ICustomerJobsProps) => {
  const navigate = useNavigate();
  if (tab.loading) return <TabTableLoader label={tab.label} />;

  return jobs.length > 0 ? (
    <div className='divide-y divide-gray-100'>
      {jobs.map((job) => (
        <JobTabItem key={job.id} job={job} />
      ))}
    </div>
  ) : (
    <EmptyTabTable
      tab={tab}
      onButtonClick={() => navigate('/jobs?create=true')}
    />
  );
};

export default JobTabTableList;
