import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import Search from '../../components/CustomElements/Search';
import NewJobModal from '../../components/Jobs/JobsModal/NewJobModal';
import { Plus } from 'lucide-react';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { TAddJob, TJob } from '../../types/Job';
import { CreateJob, GetJobs } from '../../services/Job';
import { AxiosResponse } from 'axios';
import Table from '../../components/Table/Table';
import { TPaginationData } from '../customers/Customers';
import { jobColumns } from '../../constants/Columns/JobColumns';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import { jobSortOptions } from '../../constants/Options/SortOptions/JobSortOptions';
import { useSearchParams } from 'react-router';
import { jobFilterOptions } from '../../constants/Options/FilterOptions/JobFilterOptions';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';

const Jobs = () => {
  const [jobs, setJobs] = useState<TJob[]>([]);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const initialJobFilters = {
    scheduleDate: { min: '', max: '' },
    total: { min: '', max: '' },
    status: '',
    priority: '',
  };

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

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status !== 3).length;
  const scheduledJobs = jobs.filter((j) => j.status !== 1).length;
  const totalValue = jobs.reduce(
    (accumulator, job) => accumulator + job.totalAmount,
    0
  );

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
        <div className='px-6 pt-6'>
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

          {/* Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
            {/* Total Jobs */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Jobs
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {totalJobs}
                </div>
                <div className='text-sm text-gray-500'>All-time</div>
              </div>
            </div>

            {/* Completed Jobs */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>Completed</h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {completedJobs}
                </div>
                <div className='text-sm text-gray-500'>Finished jobs</div>
              </div>
            </div>

            {/* Scheduled Jobs */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>Scheduled</h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {scheduledJobs}
                </div>
                <div className='text-sm text-gray-500'>Upcoming jobs</div>
              </div>
            </div>

            {/* Total Value */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Value
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatCurrency(totalValue)}
                </div>
                <div className='text-sm text-gray-500'>Combined job value</div>
              </div>
            </div>
          </div>

          {/* Filters and search */}
          {/* <div className='flex items-center justify-between mb-4'>
            <Search inputPlaceholder='Search jobs...' />
            <div className='relative flex items-center space-x-3'>
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
          </div> */}

          {/* Filters */}
          <div className='flex items-center justify-between gap-4 mb-8'>
            <div className='flex-1 max-w-md'>
              <Search
                inputPlaceholder='Search customers...'
                searchQuery={searchQuery}
              />
            </div>
            <div className='flex items-center gap-2'>
              <SortModal
                setIsSortModalOpen={setIsSortModalOpen}
                isSortModalOpen={isSortModalOpen}
                sortOptions={jobSortOptions}
              />
              <FilterModal
                initialFilters={initialJobFilters}
                filterOptions={jobFilterOptions}
                setIsFilterModalOpen={setIsFilterModalOpen}
                isFilterModalOpen={isFilterModalOpen}
              />
            </div>
          </div>

          {/* Table */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <Table<TJob>
              data={jobs}
              columns={jobColumns}
              paginationData={paginationData}
            />
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
