import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import Search from '../../components/CustomElements/Search';
import NewQuoteModal from '../../components/Quotes/QuotesModals/NewQuoteModal';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Table from '../../components/Table/Table';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import { TQuote, TQuoteStats } from '../../types/Quote';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import { quoteSortOptions } from '../../constants/Options/SortOptions/QuoteSortOptions';
import { quoteFilterOptions } from '../../constants/Options/FilterOptions/QuoteFilterOptions';
import { useNavigate, useSearchParams } from 'react-router';
import {
  GetQuotesByFilter,
  GetQuotesByWorkspace,
  GetQuoteStats,
} from '../../services/Quote';
import { useAuth } from '../../context/AuthProvider';
import { quoteColumns } from '../../constants/TableColumns/QuoteColumns';
import { TPaginationData } from '../customers/Customers';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import PageLoader from '../../components/CustomElements/Loaders/PageLoader';
import { DateTime } from 'luxon';

const Quotes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] =
    useState<boolean>(false);
  const [quotes, setQuotes] = useState<TQuote[]>([]);
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quoteStats, setQuoteStats] = useState<TQuoteStats>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const initialQuoteFilters = {
    createdDateMin: { min: '', max: '' },
    total: { min: '', max: '' },
    status: '',
  };

  const fetchAllQuotesByWorkspace = async () => {
    if (!user?.workspace) {
      console.warn('User or workspace not found. Cannot fetch quotes.');
      return;
    }
    setIsLoading(true);

    const paramsObj = {};
    let shouldResetPage = false;

    searchParams.forEach((value, key) => {
      if (key === 'page') {
        return;
      }
      if (key === 'createdDateMin' || key === 'createdDateMax') {
        if (value) {
          const localDate = DateTime.fromISO(value); // value like '2025-06-23'
          const utcDate =
            key === 'createdDateMax'
              ? localDate.endOf('day').toUTC()
              : localDate.startOf('day').toUTC();
          paramsObj[key] = utcDate.toISO(); // becomes '2025-06-22T22:00:00.000Z'
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
      response = await GetQuotesByFilter(
        user.workspace.id,
        finalPage,
        paginationData.pageSize,
        queryString
      );
      console.log(queryString);
    } else {
      response = await GetQuotesByWorkspace(
        user.workspace.id,
        finalPage,
        paginationData.pageSize
      );
    }

    if (response.status === 200) {
      setIsLoading(false);
      const { items, totalCount, pageSize } = response.data.payload;
      setQuotes(items);
      setPaginationData({ totalCount, pageSize });

      if (shouldResetPage && currentPage > 1) {
        const newParams = new URLSearchParams(paramsObj);
        navigate(`?${newParams.toString()}`);
      }
    } else {
      console.error('Failed to fetch quotes:', response.status, response.data);
    }
    setIsLoading(false);
  };

  const fetchQuoteStats = async () => {
    if (!user?.workspace) return;
    const response = await GetQuoteStats(user.workspace.id);
    if (response.status === 200) {
      setQuoteStats(response.data.payload);
    }
  };

  useEffect(() => {
    if (searchParams.get('create') === 'true') setIsNewQuoteModalOpen(true);
    fetchQuoteStats();
  }, []);

  useEffect(() => {
    fetchAllQuotesByWorkspace();
  }, [searchParams]);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />

        {!isLoading ? (
          <div className='px-6 pt-6'>
            {/* Page header */}
            <div className=' mb-6 flex items-center justify-between'>
              <div>
                <p className='text-heading text-4xl font-extrabold'>Quotes</p>
                <p className='text-gray-600 mt-1'>
                  Track, manage, and analyze your quotes to improve conversion
                  rates
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <CustomIconButton
                  icon={<Plus className='w-4 h-4 mr-1' />}
                  text='Create quote'
                  handleClick={() => setIsNewQuoteModalOpen(true)}
                />
              </div>
            </div>

            {/* Overview cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
              {/* Total Quotes Card */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Total Quotes
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {quoteStats?.totalQuotes}
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <span className='text-sm font-medium text-blue-600'>
                        +{Math.floor(quoteStats?.totalQuotes * 0.15)}%
                      </span>
                    </div>
                    <span className='text-sm text-gray-500'>vs last month</span>
                  </div>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Conversion Rate
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {quoteStats?.conversionRate}%
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      {quoteStats?.conversionRate > 30 ? (
                        <>
                          <ChevronUp className='w-4 h-4 text-green-500' />
                          <span className='text-sm font-medium text-green-600'>
                            +5%
                          </span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className='w-4 h-4 text-red-500' />
                          <span className='text-sm font-medium text-red-600'>
                            -2%
                          </span>
                        </>
                      )}
                    </div>
                    <span className='text-sm text-gray-500'>vs last month</span>
                  </div>
                </div>
              </div>

              {/* Total Value Card */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Total Value
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {formatCurrency(quoteStats?.totalValue)}
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      <ChevronUp className='w-4 h-4 text-green-500' />
                      <span className='text-sm font-medium text-green-600'>
                        +12%
                      </span>
                    </div>
                    <span className='text-sm text-gray-500'>vs last month</span>
                  </div>
                </div>
              </div>

              {/* Approved Value Card */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Approved Value
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {formatCurrency(quoteStats?.approvedValue)}
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      <ChevronUp className='w-4 h-4 text-green-500' />
                      <span className='text-sm font-medium text-green-600'>
                        +8%
                      </span>
                    </div>
                    <span className='text-sm text-gray-500'>vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between gap-4 mb-8'>
              <div className='flex-1 max-w-md'>
                <Search
                  inputPlaceholder='Search quotes...'
                  searchQuery={searchQuery}
                />
              </div>
              <div className='flex items-center gap-2'>
                <SortModal
                  setIsSortModalOpen={setIsSortModalOpen}
                  isSortModalOpen={isSortModalOpen}
                  sortOptions={quoteSortOptions}
                />
                <FilterModal
                  initialFilters={initialQuoteFilters}
                  filterOptions={quoteFilterOptions}
                  setIsFilterModalOpen={setIsFilterModalOpen}
                  isFilterModalOpen={isFilterModalOpen}
                />
              </div>
            </div>

            {/* Quotes table section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <Table<TQuote>
                data={quotes}
                columns={quoteColumns}
                paginationData={paginationData}
              />
            </div>
          </div>
        ) : (
          <PageLoader />
        )}
      </div>

      <NewQuoteModal
        isOpen={isNewQuoteModalOpen}
        onClose={() => setIsNewQuoteModalOpen(false)}
      />
    </div>
  );
};

export default Quotes;
