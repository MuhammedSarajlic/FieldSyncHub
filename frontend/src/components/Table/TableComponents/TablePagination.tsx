import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

interface ITablePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

const TablePagination = ({
  currentPage,
  totalPages: rawTotalPages = 1,
  totalItems,
  onPageChange,
  itemsPerPage = 10,
}: ITablePagination) => {
  // With 0 results, Math.ceil(0 / pageSize) is 0, which would otherwise
  // leave Next/Last enabled forever (currentPage=1 never equals totalPages=0).
  const totalPages = Math.max(rawTotalPages, 1);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);

  const navButtonClass = (isDisabled: boolean) =>
    `inline-flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
      isDisabled
        ? 'text-gray-300 cursor-not-allowed'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
    }`;

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-gray-200'>
      {/* Items Info */}
      <div className='text-sm text-gray-500'>
        Showing <span className='font-medium text-gray-900'>{startItem}</span>{' '}
        to <span className='font-medium text-gray-900'>{endItem}</span> of{' '}
        <span className='font-medium text-gray-900'>{totalItems}</span>{' '}
        results
      </div>

      {/* Pagination Controls */}
      <nav className='flex items-center gap-0.5' aria-label='Pagination'>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={navButtonClass(currentPage === 1)}
          title='First page'
        >
          <ChevronsLeft className='w-4 h-4' />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={navButtonClass(currentPage === 1)}
          title='Previous page'
        >
          <ChevronLeft className='w-4 h-4' />
          <span className='ml-1 hidden sm:inline'>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className='flex items-center gap-0.5 mx-1'>
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className='inline-flex items-center px-1.5 py-1.5 text-sm text-gray-400'>
                  <MoreHorizontal className='w-4 h-4' />
                </div>
              ) : (
                <button
                  onClick={() =>
                    onPageChange(
                      typeof page === 'string' ? parseInt(page, 10) : page
                    )
                  }
                  className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                    currentPage ===
                    (typeof page === 'string' ? parseInt(page, 10) : page)
                      ? 'bg-bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navButtonClass(currentPage === totalPages)}
          title='Next page'
        >
          <span className='mr-1 hidden sm:inline'>Next</span>
          <ChevronRight className='w-4 h-4' />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={navButtonClass(currentPage === totalPages)}
          title='Last page'
        >
          <ChevronsRight className='w-4 h-4' />
        </button>
      </nav>
    </div>
  );
};

export default TablePagination;
