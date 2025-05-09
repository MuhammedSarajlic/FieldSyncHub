import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import CustomButton from '../../components/CustomElements/CustomButton';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import Search from '../../components/CustomElements/Search';
import icons from '../../constants/icons';
import NewQuoteModal from '../../components/Quotes/QuotesModals/NewQuoteModal';

const Quotes = () => {
  // Sample data for quotes
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      client: 'Johnson Residence',
      quoteNumber: 'Q-2023-001',
      property: '123 Main Street',
      created: 'Apr 15, 2023',
      status: 'Approved',
      total: '$2,450.00',
    },
    {
      id: 2,
      client: 'Thompson Landscaping',
      quoteNumber: 'Q-2023-002',
      property: '456 Oak Avenue',
      created: 'Apr 17, 2023',
      status: 'Awaiting Response',
      total: '$3,875.50',
    },
    {
      id: 3,
      client: 'Garcia Construction',
      quoteNumber: 'Q-2023-003',
      property: '789 Pine Road',
      created: 'Apr 22, 2023',
      status: 'Awaiting Response',
      total: '$5,219.75',
    },
  ]);

  // Metrics calculation
  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter(
    (quote) => quote.status === 'Approved'
  ).length;
  const awaitingQuotes = quotes.filter(
    (quote) => quote.status === 'Awaiting Response'
  ).length;
  const totalValue = quotes.reduce((sum, quote) => {
    const value = parseFloat(quote.total.replace('$', '').replace(',', ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Calculate conversion rate
  const conversionRate =
    approvedQuotes > 0 ? Math.round((approvedQuotes / totalQuotes) * 100) : 0;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuotes, setFilteredQuotes] = useState(quotes);

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Awaiting Response':
        return 'bg-yellow-100 text-yellow-800';
      case 'Changes Requested':
        return 'bg-orange-100 text-orange-800';
      case 'Declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            <p className='text-heading text-4xl font-extrabold'>Quotes</p>
            <div className='flex items-center space-x-3'>
              <CustomButton
                title='New Quote'
                // handleBtnClick={() => {}}
              />
            </div>
          </div>

          {/* Overview cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {/* Overview Card */}
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <h2 className='font-medium text-gray-700 mb-3'>Overview</h2>
              <ul className='space-y-2'>
                <li className='flex items-center text-sm'>
                  <div className='w-2 h-2 rounded-full bg-gray-400 mr-2'></div>
                  <span className='text-gray-600'>Draft (0)</span>
                </li>
                <li className='flex items-center text-sm'>
                  <div className='w-2 h-2 rounded-full bg-yellow-500 mr-2'></div>
                  <span className='text-gray-600'>
                    Awaiting Response ({awaitingQuotes})
                  </span>
                </li>
                <li className='flex items-center text-sm'>
                  <div className='w-2 h-2 rounded-full bg-orange-500 mr-2'></div>
                  <span className='text-gray-600'>Changes Requested (0)</span>
                </li>
                <li className='flex items-center text-sm'>
                  <div className='w-2 h-2 rounded-full bg-green-500 mr-2'></div>
                  <span className='text-gray-600'>
                    Approved ({approvedQuotes})
                  </span>
                </li>
              </ul>
            </div>

            {/* Conversion Rate Card */}
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-center mb-2'>
                <h2 className='font-medium text-gray-700'>Conversion rate</h2>
                <span className='text-blue-600 text-sm cursor-pointer'>→</span>
              </div>
              <div className='mt-2'>
                <div className='text-3xl font-bold'>{conversionRate}%</div>
                <div className='text-green-600 text-sm mt-1 flex items-center'>
                  <span className='flex items-center'>↑ 100%</span>
                </div>
              </div>
            </div>

            {/* Sent Card */}
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-center mb-2'>
                <h2 className='font-medium text-gray-700'>Sent</h2>
                <span className='text-blue-600 text-sm cursor-pointer'>→</span>
              </div>
              <div className='mt-2'>
                <div className='text-3xl font-bold'>{totalQuotes}</div>
                <div className='text-green-600 text-sm mt-1 flex items-center'>
                  <span className='flex items-center'>↑ 100%</span>
                </div>
                <div className='text-gray-500 mt-1'>
                  ${totalValue.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Converted Card */}
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-center mb-2'>
                <h2 className='font-medium text-gray-700'>Converted</h2>
                <span className='text-blue-600 text-sm cursor-pointer'>→</span>
              </div>
              <div className='mt-2'>
                <div className='text-3xl font-bold'>{approvedQuotes}</div>
                <div className='text-green-600 text-sm mt-1 flex items-center'>
                  <span className='flex items-center'>↑ 100%</span>
                </div>
                <div className='text-gray-500 mt-1'>
                  $
                  {approvedQuotes > 0
                    ? quotes
                        .filter((q) => q.status === 'Approved')
                        .reduce(
                          (sum, q) =>
                            sum +
                            parseFloat(
                              q.total.replace('$', '').replace(',', '')
                            ),
                          0
                        )
                        .toFixed(2)
                    : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Quotes table section */}
          <div className='w-full overflow-hidden bg-white rounded-lg shadow-sm border-[1px] border-border-primary mb-6'>
            <div className='p-4 border-b border-gray-200'>
              <h2 className='font-medium text-gray-700'>
                Filtered quotes{' '}
                <span className='text-gray-400 text-sm'>
                  ({filteredQuotes.length} results)
                </span>
              </h2>
            </div>

            {/* Filters Bar */}
            <div className='flex items-center p-4 border-b border-gray-200 gap-3'>
              <div className='flex'>
                <button className='bg-gray-100 text-gray-700 px-3 py-1.5 rounded-l text-sm border border-gray-300'>
                  Status
                </button>
                <button className='bg-white text-gray-700 px-3 py-1.5 rounded-r text-sm border border-gray-300 border-l-0 flex items-center'>
                  All
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 ml-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
              </div>

              <div className='flex'>
                <button className='bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  All
                </button>
              </div>

              <div className='flex'>
                <button className='bg-gray-100 text-gray-700 px-3 py-1.5 rounded-l text-sm border border-gray-300'>
                  Salesperson
                </button>
                <button className='bg-white text-gray-700 px-3 py-1.5 rounded-r text-sm border border-gray-300 border-l-0 flex items-center'>
                  All
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 ml-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
              </div>

              <div className='ml-auto'>
                <Search inputPlaceholder='Search quotes...' />
              </div>
            </div>

            {/* Quotes Table */}
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-[#F9FBFC]'>
                  <tr>
                    <th className='px-4 py-2 text-left text-sm font-medium text-heading'>
                      <input
                        type='checkbox'
                        className='rounded border-gray-300'
                      />
                    </th>
                    <th className='px-4 py-2 text-left text-sm font-medium text-heading'>
                      Client
                    </th>
                    <th className='px-4 py-2 text-left text-sm font-medium text-heading'>
                      Quote number
                    </th>
                    <th className='px-4 py-2 text-left text-sm font-medium text-heading'>
                      Property
                    </th>
                    <th className='px-4 py-2 text-left text-sm font-medium text-heading'>
                      Created
                    </th>
                    <th className='px-4 py-2 text-left text-sm font-medium text-heading'>
                      Status
                    </th>
                    <th className='px-4 py-2 text-right text-sm font-medium text-heading'>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {quotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className='hover:bg-gray-50 cursor-pointer'
                    >
                      <td className='px-4 py-5 whitespace-nowrap'>
                        <input
                          type='checkbox'
                          className='rounded border-gray-300'
                        />
                      </td>
                      <td className='px-4 py-5 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='text-sm font-medium text-blue-600'>
                            {quote.client}
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-5 whitespace-nowrap text-sm text-gray-600'>
                        {quote.quoteNumber}
                      </td>
                      <td className='px-4 py-5 whitespace-nowrap text-sm text-gray-600'>
                        {quote.property}
                      </td>
                      <td className='px-4 py-5 whitespace-nowrap text-sm text-gray-600'>
                        {quote.created}
                      </td>
                      <td className='px-4 py-5 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            quote.status
                          )}`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className='px-4 py-5 whitespace-nowrap text-right text-sm font-medium'>
                        {quote.total}
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr>
                      <td
                        colSpan='7'
                        className='px-4 py-8 text-center text-gray-500'
                      >
                        No results for selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination component */}
            <div className='px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                  Previous
                </button>
                <button className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                  Next
                </button>
              </div>
              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    Showing <span className='font-medium'>1</span> to{' '}
                    <span className='font-medium'>{quotes.length}</span> of{' '}
                    <span className='font-medium'>{quotes.length}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                    aria-label='Pagination'
                  >
                    <button className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                      <span className='sr-only'>Previous</span>
                      <svg
                        className='h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                    <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50'>
                      1
                    </button>
                    <button className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                      <span className='sr-only'>Next</span>
                      <svg
                        className='h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <NewQuoteModal isOpen={true} /> */}
    </div>
  );
};

export default Quotes;
