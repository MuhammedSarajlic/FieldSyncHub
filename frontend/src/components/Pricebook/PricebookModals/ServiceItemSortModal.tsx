import { Check } from 'lucide-react';
import { TSortOption } from '../../../types/ServiceItem';

interface IServiceItemSortModal {
  isOpen: boolean;
  onClose: () => void;
  onSort: (optionId: string) => void;
  sortOptions: TSortOption[];
  currentSort?: string;
}

const ServiceItemSortModal = ({
  isOpen,
  onClose,
  onSort,
  sortOptions,
  currentSort,
}: IServiceItemSortModal) => {
  if (!isOpen) return null;

  return (
    <div className='absolute right-0 top-full mt-2 bg-white rounded-md shadow-md border border-gray-200 z-50 w-64'>
      <div>
        <div className='px-3 py-2 flex items-center justify-between border-b border-gray-200'>
          <h3 className='font-semibold text-gray-800'>Sort By</h3>
          <button
            onClick={onClose}
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
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700'
              } ${
                index === sortOptions.length - 1
                  ? ''
                  : 'border-b border-gray-100'
              }`}
              onClick={() => {
                onSort(option.id);
                onClose();
              }}
            >
              <span>{option.label}</span>
              {currentSort === option.id && (
                <Check className='h-4 w-4 text-blue-600' />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceItemSortModal;
