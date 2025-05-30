import TableHeader from '../../Table/TableComponents/TableHeader';
import TableBody from '../../Table/TableComponents/TableBody';
import TablePagination from '../../Table/TableComponents/TablePagination';
import { usePagination } from '../../../hooks/usePagination';
import { useState } from 'react';

const QuoteTable = () => {
  const [quotes, setQuotes] = useState([
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
      quoteNumber: 'Q-2023-002',
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
  const columns = [
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
      statusConfig: (status) => {
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

  // Handle row click
  const handleRowClick = (quote, rowIndex) => {
    console.log('Quote clicked:', quote);
    // Add your navigation or modal logic here
  };

  // Handle row styling (optional)
  const getRowClassName = (quote, rowIndex): string => {
    // Add conditional styling based on quote data
    if (quote.status === 'Approved') {
      return 'bg-green-50';
    }
    return '';
  };

  // Empty state component
  const emptyState = (
    <div className='text-center py-8'>
      <div className='text-gray-500 text-sm'>No quotes found</div>
      <div className='text-gray-400 text-xs mt-1'>
        Try adjusting your filters or create a new quote
      </div>
    </div>
  );
  const { currentPage, onPageChange } = usePagination(1, 'page');
  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <TableHeader columns={columns} />
          <TableBody
            data={quotes}
            columns={columns}
            onRowClick={handleRowClick}
            rowClassName={getRowClassName}
            emptyState={emptyState}
            loading={false} // Set to true when loading data
          />
        </table>
      </div>
      <TablePagination
        // Add pagination props here based on your TablePagination component
        currentPage={currentPage}
        totalPages={1}
        totalItems={quotes.length}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default QuoteTable;
