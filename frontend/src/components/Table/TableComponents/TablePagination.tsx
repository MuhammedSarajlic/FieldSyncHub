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
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage = 10,
}: ITablePagination) => {
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-gray-200`}
    >
      {/* Items Info */}

      <div className='text-sm text-gray-600 font-medium'>
        Showing <span className='text-gray-900'>{startItem}</span> to{' '}
        <span className='text-gray-900'>{endItem}</span> of{' '}
        <span className='text-gray-900'>{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className='flex items-center'>
        <nav className='flex items-center gap-1' aria-label='Pagination'>
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`group relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPage === 1
                ? 'text-gray-300'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none cursor-pointer'
            }`}
            title='First page'
          >
            <ChevronsLeft className='w-4 h-4' />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`group relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPage === 1
                ? 'text-gray-300'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none cursor-pointer'
            }`}
            title='Previous page'
          >
            <ChevronLeft className='w-4 h-4' />
            <span className='ml-1 hidden sm:inline'>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className='flex items-center gap-1 mx-2'>
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <div className='relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400'>
                    <MoreHorizontal className='w-4 h-4' />
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      onPageChange(
                        typeof page === 'string' ? parseInt(page, 10) : page
                      )
                    }
                    className={`relative inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:z-10 focus:outline-none cursor-pointer ${
                      currentPage ===
                      (typeof page === 'string' ? parseInt(page, 10) : page)
                        ? 'z-10 bg-gradient-to-br from-bg-primary/90 to-emerald-800/90 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:scale-105'
                    }`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`group relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPage === totalPages
                ? 'text-gray-300'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none cursor-pointer'
            }`}
            title='Next page'
          >
            <span className='mr-1 hidden sm:inline'>Next</span>
            <ChevronRight className='w-4 h-4' />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`group relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPage === totalPages
                ? 'text-gray-300'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none cursor-pointer'
            }`}
            title='Last page'
          >
            <ChevronsRight className='w-4 h-4' />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TablePagination;
