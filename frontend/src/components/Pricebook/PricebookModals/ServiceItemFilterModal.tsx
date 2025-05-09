import { useState } from 'react';
import { Sliders, X, Check } from 'lucide-react';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import CustomIconButton from '../../CustomElements/CustomIconButton';
import { TServiceItemFilter } from '../../../types/ServiceItem';

interface IServiceItemFilterModal {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: TServiceItemFilter) => void;
}

const ServiceItemFilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
}: IServiceItemFilterModal) => {
  const [filters, setFilters] = useState<TServiceItemFilter>({
    category: '',
    price: { min: '', max: '' },
    hours: { min: '', max: '' },
    status: 'all',
    images: 'any',
    description: '',
  });

  const categories = [
    'Web Design',
    'Mobile App',
    'Branding',
    'Marketing',
    'Consulting',
    'Other',
  ];

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

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      category: '',
      price: { min: '', max: '' },
      hours: { min: '', max: '' },
      status: 'all',
      images: 'any',
      description: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='absolute right-0 top-full mt-2 w-[400px] max-w-md z-50'>
      <div className='bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto shadow-xl'>
        {/* Header */}
        <div className='sticky top-0 p-4 border-b border-gray-300 flex justify-between items-center'>
          <div className='flex items-center'>
            <Sliders className='h-5 w-5 mr-2 text-gray-600' />
            <h2 className='text-lg font-semibold text-gray-800'>Filters</h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Filters */}
        <div className='p-6 space-y-6'>
          {/* Category Filter */}
          <div>
            <label
              htmlFor='category'
              className='block text-sm font-medium text-gray-700'
            >
              Category
            </label>
            <select
              id='category'
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            >
              <option value=''>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Price Range ($)
            </label>
            <div className='flex space-x-2 items-center'>
              <input
                type='number'
                value={filters.price.min}
                onChange={(e) =>
                  handleRangeChange('price', 'min', parseInt(e.target.value))
                }
                min='0'
                placeholder='0'
                className='w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
              />
              <span className='text-gray-500'>to</span>
              <input
                type='number'
                value={filters.price.max}
                onChange={(e) =>
                  handleRangeChange('price', 'max', parseInt(e.target.value))
                }
                min='0'
                placeholder='1000'
                className='w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Hours
            </label>
            <div className='flex space-x-2 items-center'>
              <input
                type='number'
                value={filters.hours.min}
                onChange={(e) =>
                  handleRangeChange('hours', 'min', parseInt(e.target.value))
                }
                min='0'
                placeholder='0'
                className='w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
              />
              <span className='text-gray-500'>to</span>
              <input
                type='number'
                value={filters.hours.max}
                onChange={(e) =>
                  handleRangeChange('hours', 'max', parseInt(e.target.value))
                }
                min='0'
                placeholder='40'
                className='w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Status
            </label>
            <div className='flex space-x-2'>
              {['all', 'active', 'inactive'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleFilterChange('status', option)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border 
                    ${
                      filters.status === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Images
            </label>
            <div className='flex space-x-2'>
              {['any', 'has', 'none'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleFilterChange('images', option)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border 
                    ${
                      filters.images === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                >
                  {option === 'any'
                    ? 'Any'
                    : option === 'has'
                    ? 'Has Images'
                    : 'No Images'}
                </button>
              ))}
            </div>
          </div>

          {/* Description Search */}
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700'
            >
              Description
            </label>
            <input
              type='text'
              id='description'
              value={filters.description}
              onChange={(e) =>
                handleFilterChange('description', e.target.value)
              }
              placeholder='Search by keyword...'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>
        </div>

        {/* Actions */}
        <div className='p-4 border-t border-gray-300 flex justify-end space-x-2'>
          <ButtonIcon
            name='Reset'
            customStyle='shadow-sm'
            handleBtnClick={handleReset}
          />
          <CustomIconButton
            text='Apply fitlers'
            icon={<Check className='h-4 w-4 mr-2' />}
            handleClick={handleApply}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceItemFilterModal;
