import { ArrowUpDown, Check } from 'lucide-react';
import { TSortOption } from '../../../types/ServiceItem';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface ISortModal {
  setIsSortModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSortModalOpen: boolean;
  sortOptions: TSortOption[];
}

const SortModal = ({
  setIsSortModalOpen,
  isSortModalOpen,
  sortOptions,
}: ISortModal) => {
  const [currentSort, setCurrentSort] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const ref = useClickOutside<HTMLDivElement>(() => setIsSortModalOpen(false));

  const handleSort = (optionId: string) => {
    setCurrentSort(optionId);
    const selectedOption = sortOptions.find((opt) => opt.id === optionId);
    if (selectedOption) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('sortBy', selectedOption.sortBy);
        newParams.set('sort', selectedOption.sort);
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('sortBy');
        newParams.delete('sort');
        return newParams;
      });
    }
    setIsSortModalOpen(false);
  };

  useEffect(() => {
    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sort');

    if (sortByParam && sortOrderParam) {
      const matchingOption = sortOptions.find(
        (opt) => opt.sortBy === sortByParam && opt.sort === sortOrderParam
      );
      if (matchingOption) {
        setCurrentSort(matchingOption.id);
      } else {
        setCurrentSort('');
      }
    } else {
      setCurrentSort('');
    }
  }, [searchParams]);

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setIsSortModalOpen(!isSortModalOpen)}
        className='inline-flex items-center px-2.5 py-1.5 cursor-pointer border border-gray-300 rounded-lg text-sm font-medium text-heading bg-white hover:bg-gray-50 transition-colors'
      >
        <ArrowUpDown className='h-3.5 w-3.5 mr-1.5' />
        Sort
      </button>
      {isSortModalOpen && (
        <div className='absolute right-0 top-full mt-2 bg-white rounded-md shadow-md border border-gray-200 z-50 w-64'>
          <div>
            <div className='px-3 py-2 flex items-center justify-between border-b border-gray-200'>
              <h3 className='font-semibold text-gray-800'>Sort By</h3>
              <button
                onClick={() => setIsSortModalOpen(false)}
                className='text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
            <div className=''>
              {sortOptions.map((option, index) => (
                <button
                  key={option.id}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 focus:outline-none cursor-pointer ${
                    currentSort === option.id
                      ? 'bg-bg-primary/10 text-bg-primary font-medium'
                      : 'text-gray-700'
                  } ${
                    index === sortOptions.length - 1
                      ? ''
                      : 'border-b border-gray-100'
                  }`}
                  onClick={() => {
                    handleSort(option.id);
                    setIsSortModalOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {currentSort === option.id && (
                    <Check className='h-4 w-4 text-bg-primary' />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortModal;
