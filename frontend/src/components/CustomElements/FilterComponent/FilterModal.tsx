import { Check, Filter, X } from 'lucide-react';
import ButtonIcon from '../ButtonIcon';
import CustomIconButton from '../CustomIconButton';
import { useEffect, useState } from 'react';
import { renderFilterComponent } from '../../../utils/RenderHelpers/RenderFilterComponent';
import useClearFilters from '../../../hooks/useClearFilters';
import { useSearchParams } from 'react-router';
import { TFilterOption } from '../../../types/FilterOption';

interface IFilterModal<T> {
  initialFilters: T;
  filterOptions: TFilterOption[];
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFilterModalOpen: boolean;
}

const FilterModal = <T extends Record<string, any>>({
  initialFilters,
  filterOptions,
  setIsFilterModalOpen,
  isFilterModalOpen,
}: IFilterModal<T>) => {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearFilterURLParams } = useClearFilters();

  const handleFilterChange = (filterName: keyof T, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleRangeChange = (
    filterName: keyof T,
    key: string,
    value: number | string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: {
        ...(prev[filterName] || {}),
        [key]: value,
      },
    }));
  };

  const handleApplyFilters = (filters: T) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      filterOptions.forEach((option) => {
        const value = filters[option.name];

        if (option.type === 'range' && value) {
          if (value.min) {
            newParams.set(`${option.name}Min`, value.min.toString());
          } else {
            newParams.delete(`${option.name}Min`);
          }

          if (value.max) {
            newParams.set(`${option.name}Max`, value.max.toString());
          } else {
            newParams.delete(`${option.name}Max`);
          }
        } else if (option.type === 'dropdown' && value === 'all') {
          newParams.delete(option.name);
        } else if (option.type === 'button-select' && value === 'all') {
          newParams.delete(option.name);
        } else if (value) {
          newParams.set(option.name, value.toString());
        } else {
          newParams.delete(option.name);
        }
      });

      return newParams;
    });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    clearFilterURLParams(filterOptions);
  };

  const handleApply = () => {
    handleApplyFilters(filters);
    setIsFilterModalOpen(false);
  };

  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const initialValue = initialFilters[key];
    const currentValue = filters[key];

    if (
      typeof initialValue === 'object' &&
      initialValue !== null &&
      typeof currentValue === 'object' &&
      currentValue !== null
    ) {
      return JSON.stringify(initialValue) !== JSON.stringify(currentValue);
    }
    return initialValue !== currentValue;
  }).length;

  const getFiltersFromURL = <T extends Record<string, any>>(
    searchParams: URLSearchParams,
    filterOptions: TFilterOption[],
    initialFilters: T
  ): T => {
    const parsedFilters: any = { ...initialFilters };

    filterOptions.forEach((option) => {
      if (option.type === 'range') {
        const start = searchParams.get(`${option.name}Min`);
        const end = searchParams.get(`${option.name}Max`);
        parsedFilters[option.name] = {
          min: start || initialFilters[option.name]?.min || '',
          max: end || initialFilters[option.name]?.max || '',
        };
      } else {
        const param = searchParams.get(option.name);
        parsedFilters[option.name] = param ?? initialFilters[option.name];
      }
    });

    return parsedFilters;
  };

  useEffect(() => {
    const hasActiveParams = filterOptions.some((option) => {
      if (option.type === 'range') {
        return (
          searchParams.get(`${option.name}Min`) ||
          searchParams.get(`${option.name}Max`)
        );
      } else {
        return searchParams.get(option.name);
      }
    });

    if (!hasActiveParams) {
      setFilters(initialFilters);
    } else {
      const extracted = getFiltersFromURL(
        searchParams,
        filterOptions,
        initialFilters
      );
      setFilters(extracted);
    }
  }, [searchParams]);

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
        <div className='absolute right-0 top-full mt-2 w-[400px] max-w-md z-50 pb-10'>
          <div className='bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto shadow-xl'>
            {/* Header */}
            <div className='sticky top-0 p-4 py-3 border-b border-gray-300 flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-800'>Filters</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className='text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Filters */}
            <div className='p-4 space-y-6'>
              {filterOptions.map((option: TFilterOption) =>
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
                text='Apply filters'
                icon={<Check className='h-4 w-4 mr-2' />}
                handleClick={handleApply}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterModal;
