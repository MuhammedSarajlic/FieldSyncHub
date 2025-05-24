import { Check, Filter, X } from 'lucide-react';
import ButtonIcon from '../ButtonIcon';
import CustomIconButton from '../CustomIconButton';
import { useState } from 'react';
import { renderFilterComponent } from '../../../utils/RenderFilterComponent';

interface IFilterModal {
  filterOptions: any;
  activeFiltersCount: number;
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFilterModalOpen: boolean;
}

const FilterModal = ({
  filterOptions,
  activeFiltersCount,
  setIsFilterModalOpen,
  isFilterModalOpen,
}: IFilterModal) => {
  const [filters, setFilters] = useState<{ [key: string]: any }>({});

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  const handleRangeChange = (
    filterName: string,
    key: string,
    value: number
  ) => {
    setFilters({
      ...filters,
      [filterName]: {
        ...filters[filterName],
        [key]: value,
      },
    });
  };

  const handleReset = () => {
    setFilters({
      hireDate: { startDate: '', endDate: '' },
      status: 'all',
      position: '',
      department: '',
    });
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
        className='relative inline-flex items-center px-3 py-2 cursor-pointer border border-gray-300 rounded-lg text-sm font-semibold text-heading bg-white hover:bg-gray-50'
      >
        <Filter className='h-4 w-4 mr-2' />
        Filter
        {activeFiltersCount > 0 && (
          <span className='absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center'>
            {activeFiltersCount}
          </span>
        )}
      </button>
      {isFilterModalOpen && (
        <div className='absolute right-0 top-full mt-2 w-[400px] max-w-md z-50'>
          <div className='bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto shadow-xl'>
            {/* Header */}
            <div className='sticky top-0 p-4 py-3 border-b border-gray-300 flex justify-between items-center'>
              <div className='flex items-center'>
                <h2 className='text-lg font-semibold text-gray-800'>Filters</h2>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className='text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Filters */}
            <div className='p-4 space-y-6'>
              {filterOptions.map((option) =>
                renderFilterComponent({
                  option,
                  filters,
                  handleFilterChange,
                  handleRangeChange,
                })
              )}
            </div>

            {/* Actions */}
            <div className='p-4 border-t border-gray-300 flex justify-end space-x-2'>
              <ButtonIcon
                name='Reset Filters'
                customStyle='shadow-sm'
                handleBtnClick={handleReset}
              />
              <CustomIconButton
                text='Apply fitlers'
                icon={<Check className='h-4 w-4 mr-2' />}
                //   handleClick={handleApply}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterModal;
