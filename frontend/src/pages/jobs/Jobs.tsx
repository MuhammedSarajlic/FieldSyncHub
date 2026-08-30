import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import Search from '../../components/CustomElements/Search';
import NewJobModal from '../../components/Jobs/JobsModal/NewJobModal';
import { Plus } from 'lucide-react';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { TJob, TJobStats } from '../../types/Job';
import {
  GetJobsByFilter,
  GetJobsByWorkspaceId,
  GetJobStats,
} from '../../services/Job';
import Table from '../../components/Table/Table';
import { TPaginationData } from '../../types/Table';
import { jobColumns } from '../../constants/TableColumns/JobColumns';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import { useNavigate, useSearchParams } from 'react-router';
import { jobFilterOptions } from '../../constants/Options/FilterOptions/JobFilterOptions';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { useAuth } from '../../context/AuthProvider';
import { DateTime } from 'luxon';

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<TJob[]>([]);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobStats, setJobStats] = useState<TJobStats>({
    totalJobs: 0,
    completedJobs: 0,
    scheduledJobs: 0,
    totalValue: 0,
  });
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

  const fetchAllJobsByWorkspace = async () => {
    if (!user?.workspace) {
      console.warn('User or workspace not found. Cannot fetch jobs.');
      return;
    }
    setIsLoading(true);

    const paramsObj = {};
    let shouldResetPage = false;

    searchParams.forEach((value, key) => {
      if (key === 'page') return;
      if (key === 'scheduleDateMin' || key === 'scheduleDateMax') {
        if (value) {
          const localDate = DateTime.fromISO(value); // from luxon or similar
          const utcDate =
            key === 'scheduleDateMax'
              ? localDate.endOf('day').toUTC()
              : localDate.startOf('day').toUTC();
          paramsObj[key] = utcDate.toISO(); // e.g. '2025-06-22T22:00:00.000Z'
        }
      } else {
        paramsObj[key] = value;
      }
      shouldResetPage = true;
    });

    const currentPage = searchParams.get('page')
      ? parseInt(searchParams.get('page')!, 10)
      : 1;

    const finalPage = shouldResetPage ? 1 : currentPage;
    const queryString = new URLSearchParams(paramsObj).toString();
    const hasAnyParam = Object.keys(paramsObj).length > 0;

    let response;

    if (hasAnyParam) {
      response = await GetJobsByFilter(
        user.workspace.id,
        finalPage,
        paginationData.pageSize,
        queryString
      );
    } else {
      response = await GetJobsByWorkspaceId(
        user.workspace.id,
        finalPage,
        paginationData.pageSize
      );
    }

    if (response.status === 200) {
      setIsLoading(false);
      const { items, totalCount, pageSize } = response.data.payload;
      setJobs(items);
      setPaginationData({ totalCount, pageSize });

      if (shouldResetPage && currentPage > 1) {
        const newParams = new URLSearchParams(paramsObj);
        navigate(`?${newParams.toString()}`);
      }
      return response.data.payload;
    } else {
      console.error('Failed to fetch jobs:', response.status, response.data);
    }
    setIsLoading(false);
    return undefined;
  };

  const fetchJobStats = async () => {
    if (!user?.workspace) return;
    const response = await GetJobStats(user.workspace.id);
    if (response.status === 200) {
      setJobStats(response.data.payload);
      return response.data.payload;
    }
    return undefined;
  };

  const jobsQuery = useQuery({
    queryKey: ['jobs', user?.workspace?.id, searchParams.toString()],
    queryFn: fetchAllJobsByWorkspace,
    enabled: Boolean(user?.workspace?.id),
    staleTime: 30_000,
  });

  const jobStatsQuery = useQuery({
    queryKey: ['job-stats', user?.workspace?.id],
    queryFn: fetchJobStats,
    enabled: Boolean(user?.workspace?.id),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (jobsQuery.data) {
      setJobs(jobsQuery.data.items);
      setPaginationData({
        totalCount: jobsQuery.data.totalCount,
        pageSize: jobsQuery.data.pageSize,
      });
    }
    if (jobStatsQuery.data) setJobStats(jobStatsQuery.data);
  }, [jobsQuery.data, jobStatsQuery.data]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') setIsNewJobModalOpen(true);
  }, []);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 md:ml-64'>
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
                  {jobStats.totalJobs}
                </div>
                <div className='text-sm text-gray-500'>All-time</div>
              </div>
            </div>

            {/* Completed Jobs */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>Completed</h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {jobStats.completedJobs}
                </div>
                <div className='text-sm text-gray-500'>Finished jobs</div>
              </div>
            </div>

            {/* Scheduled Jobs */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>Scheduled</h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {jobStats.scheduledJobs}
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
                  {formatCurrency(jobStats.totalValue)}
                </div>
                <div className='text-sm text-gray-500'>Combined job value</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='flex items-center justify-between gap-4 mb-8'>
            <div className='flex-1 max-w-md'>
              <Search
                inputPlaceholder='Search customers...'
                searchQuery={searchQuery}
              />
            </div>
            <div className='flex items-center gap-2'>
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
                  loading={isLoading}
            />
          </div>
        </div>
      </div>
      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        setJobs={setJobs}
      />
    </div>
  );
};

export default Jobs;
