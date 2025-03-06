import icons from '../../../../../constants/icons';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsJobItem from './CustomerDetailsJobItem';

const CustomerJobs = () => {
  const jobs = [
    {
      jobId: 'J-1234',
      schedule: 20,
      property: 'Hamida 25, Zenica 72000, Federacija Bosne i Hercegovine',
      total: 120.0,
    },
  ];
  return (
    <div className='w-full'>
      {jobs.length > 0 ? (
        jobs.map((job) => <CustomerDetailsJobItem key={job.jobId} />)
      ) : (
        <EmptyTabTable name='jobs' btnName='job' icon={icons.hammerIcons} />
      )}
    </div>
  );
};

export default CustomerJobs;
