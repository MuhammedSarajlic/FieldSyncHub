import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import Search from '../../components/CustomElements/Search';
import NewQuoteModal from '../../components/Quotes/QuotesModals/NewQuoteModal';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Table from '../../components/Table/Table';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import { TTableColumns } from '../../types/Table';
import { TQuote } from '../../types/Quote';

const Quotes = () => {
  const [quotes, setQuotes] = useState<TQuote[]>([
    {
      id: 1,
      client: 'Johnson Residence',
      quoteNumber: 'Q-2023-001',
      property: '123 Main Street',
      created: 'Apr 15, 2023',
      status: 'Approved',
      total: 2450.0,
      lastUpdated: 'Apr 18, 2023',
      expiryDate: 'May 15, 2023',
    },
    {
      id: 2,
      client: 'Thompson Landscaping',
      quoteNumber: 'Q-2025-002',
      property: '456 Oak Avenue',
      created: 'Apr 17, 2023',
      status: 'Awaiting Response',
      total: 3875.5,
      lastUpdated: 'Apr 17, 2023',
      expiryDate: 'May 17, 2023',
    },
    {
      id: 3,
      client: 'Garcia Construction',
      quoteNumber: 'Q-2023-003',
      property: '789 Pine Road',
      created: 'Apr 22, 2023',
      status: 'Awaiting Response',
      total: 5219.75,
      lastUpdated: 'Apr 22, 2023',
      expiryDate: 'May 22, 2023',
    },
  ]);

  const quoteColumns: TTableColumns = [
    {
      header: 'Client',
      accessor: 'client',
      type: 'text',
      bold: true,
      width: '200px',
    },
    {
      header: 'Quote Number',
      accessor: 'quoteNumber',
      type: 'text',
      width: '150px',
    },
    {
      header: 'Property',
      accessor: 'property',
      type: 'text',
      width: '200px',
    },
    {
      header: 'Created',
      accessor: 'created',
      type: 'text', // or 'date' if you want to parse it as a date
      width: '120px',
    },
    {
      header: 'Status',
      accessor: 'status',
      type: 'status',
      width: '150px',
      statusConfig: (status: string) => {
        switch (status) {
          case 'Approved':
            return {
              color: 'bg-green-100 text-green-800 border-green-200',
              icon: null,
            };
          case 'Awaiting Response':
            return {
              color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              icon: null,
            };
          case 'Rejected':
            return {
              color: 'bg-red-100 text-red-800 border-red-200',
              icon: null,
            };
          default:
            return {
              color: 'bg-gray-100 text-gray-800 border-gray-200',
              icon: null,
            };
        }
      },
    },
    {
      header: 'Total',
      accessor: 'total',
      type: 'currency',
      align: 'right',
      width: '120px',
    },
  ];

  // Metrics calculation
  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter(
    (quote) => quote.status === 'Approved'
  ).length;
  // const awaitingQuotes = quotes.filter(
  //   (quote) => quote.status === 'Awaiting Response'
  // ).length;
  // const draftQuotes = quotes.filter((quote) => quote.status === 'Draft').length;

  const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const approvedValue = quotes
    .filter((q) => q.status === 'Approved')
    .reduce((sum, quote) => sum + quote.total, 0);

  // Calculate conversion rate
  const conversionRate =
    approvedQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;

  // const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('');

  // Get status color class
  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'Approved':
  //       return 'bg-green-100 text-green-800';
  //     case 'Awaiting Response':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'Changes Requested':
  //       return 'bg-orange-100 text-orange-800';
  //     case 'Declined':
  //       return 'bg-red-100 text-red-800';
  //     case 'Draft':
  //       return 'bg-gray-100 text-gray-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

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
                // onClick={() => setIsNewQuoteModalOpen(true)}
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

          <div className='mb-8'>
            <Search inputPlaceholder='Search quotes...' />
            {/* <SortModal />
            <FilterModal /> */}
          </div>

          {/* Quotes table section */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <Table<TQuote> data={quotes} columns={quoteColumns} />
          </div>
        </div>
      </div>

      {/* Modal for new quote */}
      {/* <NewQuoteModal 
        isOpen={isNewQuoteModalOpen} 
        onClose={() => setIsNewQuoteModalOpen(false)}
      /> */}
    </div>
  );
};

export default Quotes;
