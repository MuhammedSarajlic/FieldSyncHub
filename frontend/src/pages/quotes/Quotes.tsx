import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import Search from '../../components/CustomElements/Search';
import NewQuoteModal from '../../components/Quotes/QuotesModals/NewQuoteModal';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Table from '../../components/Table/Table';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import { TQuote } from '../../types/Quote';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import { quoteSortOptions } from '../../constants/Options/SortOptions/QuoteSortOptions';
import { quoteFilterOptions } from '../../constants/Options/FilterOptions/QuoteFilterOptions';
import { useSearchParams } from 'react-router';
import { GetQuoteByWorkspace } from '../../services/Quote';
import { useAuth } from '../../context/AuthProvider';
import { QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { quoteColumns } from '../../constants/Columns/QuoteColumns';
import { TPaginationData } from '../customers/Customers';

const Quotes = () => {
  const { user } = useAuth();
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] =
    useState<boolean>(false);
  const [quotes, setQuotes] = useState<TQuote[]>([]);
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const conversionRate = 1;

  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const approvedValue = quotes
    .filter((q) => q.status === QuoteStatus.Approved)
    .reduce((sum, quote) => sum + quote.total, 0);

  const initialQuoteFilters = {
    createdDateMin: { min: '', max: '' },
    total: { min: '', max: '' },
    status: '',
  };

  const fetchQuotesByWorkspace = async () => {
    if (!user || !user.workspace) return;
    const response = await GetQuoteByWorkspace(user.workspace.id);
    if (response.status === 200) {
      setQuotes(response.data);
    }
  };

  useEffect(() => {
    fetchQuotesByWorkspace();
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
                  {totalQuotes}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-sm font-medium text-blue-600'>
                      +{Math.floor(totalQuotes * 0.15)}%
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
                  {conversionRate}%
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    {conversionRate > 30 ? (
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
                  $
                  {totalValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
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
                  $
                  {approvedValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
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
      </div>

      <NewQuoteModal
        isOpen={isNewQuoteModalOpen}
        onClose={() => setIsNewQuoteModalOpen(false)}
      />
    </div>
  );
};

export default Quotes;
