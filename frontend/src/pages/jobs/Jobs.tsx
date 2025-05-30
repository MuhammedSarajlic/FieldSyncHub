import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import JobsTable from '../../components/Jobs/JobsTable/JobsTable';
import CustomButton from '../../components/CustomElements/CustomButton';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import Search from '../../components/CustomElements/Search';
import icons from '../../constants/icons';
import JobFilterModal from '../../components/Jobs/JobsFilter/JobFilterModal';
import NewJobModal from '../../components/Jobs/JobsModal/NewJobModal';
import JobsSortModal from '../../components/Jobs/JobsModal/JobsSortModal';
import { Plus } from 'lucide-react';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { TAddJob, TJob } from '../../types/Job';
import { CreateJob, GetJobs } from '../../services/Job';
import { AxiosResponse } from 'axios';

const Jobs = () => {
  const [jobs, setJobs] = useState<TJob[]>([]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const totalJobs = jobs.length;

  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleAddJob = async (
    job: TAddJob
  ): Promise<AxiosResponse<any, any>> => {
    const response = await CreateJob(job);
    return response;
  };

  const fetchJobs = async () => {
    const response = await GetJobs();
    if (response.status === 200) {
      setJobs(response.data.payload);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar />
        </div>

        {/* Main content */}
        <div className='px-4'>
          {/* Page header */}
          <div className='pb-4 mb-4 flex items-center justify-between'>
            <p className='text-heading text-4xl font-extrabold'>Jobs</p>
            <div className='flex items-center space-x-3'>
              <CustomIconButton
                text={'Create job'}
                icon={<Plus size={16} className='mr-1.5' />}
                handleClick={() => setIsNewJobModalOpen(true)}
              />
            </div>
          </div>

          {/* Overview cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-bg-primary/10 text-bg-primary mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>
                    Total Jobs
                  </p>
                  <p className='text-xl font-bold'>{totalJobs}</p>
                </div>
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-bg-primary/10 text-bg-primary mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>Completed</p>
                  {/* <p className='text-xl font-bold'>{completedJobs}</p> */}
                  <p className='text-xl font-bold'>1</p>
                </div>
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-bg-primary/10 text-bg-primary mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>Scheduled</p>
                  {/* <p className='text-xl font-bold'>{scheduledJobs}</p> */}
                  <p className='text-xl font-bold'>5</p>
                </div>
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-bg-primary/10 text-bg-primary mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>
                    Total Value
                  </p>
                  <p className='text-xl font-bold'>$100</p>
                  {/* <p className='text-xl font-bold'>${totalValue.toFixed(2)}</p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Filters and search */}
          <div className='flex items-center justify-between mb-4'>
            <Search inputPlaceholder='Search jobs...' />
            <div className='relative flex items-center space-x-3'>
              {/* <ButtonIcon name='Sort' icon={icons.sortIcon} /> */}
              {<JobsSortModal />}
              <ButtonIcon
                name='Filter'
                icon={icons.filterIcon}
                handleBtnClick={() => setIsFilterModalOpen(true)}
              />
              {isFilterModalOpen && (
                <JobFilterModal
                  filters={filters}
                  setFilters={setFilters}
                  onClose={() => setIsFilterModalOpen(false)}
                />
              )}
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6'>
            <JobsTable jobs={jobs} />
          </div>
        </div>
      </div>
      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onCreate={handleAddJob}
        fetchJobs={fetchJobs}
      />
    </div>
  );
};

export default Jobs;
