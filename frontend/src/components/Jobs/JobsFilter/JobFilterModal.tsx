import { useState } from 'react';
import ButtonIcon from '../../CustomElements/ButtonIcon';
import CustomButton from '../../CustomElements/CustomButton';

interface FilterValues {
  status: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
}

interface JobFilterModalProps {
  filters: FilterValues;
  setFilters: (filters: FilterValues) => void;
  onClose: () => void;
}

const JobFilterModal = ({
  filters,
  setFilters,
  onClose,
}: JobFilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const applyFilters = () => {
    setFilters(localFilters);
    onClose();
  };

  const resetAllFilters = () => {
    setLocalFilters({ status: '', priority: '', dateFrom: '', dateTo: '' });
    setFilters({ status: '', priority: '', dateFrom: '', dateTo: '' });
  };

  return (
    <div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4'>
      <h3 className='text-lg font-semibold text-gray-700 mb-4'>Filter</h3>

      {/* Date Range */}
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <label className='block text-base text-gray-600'>Date range</label>
          <button
            onClick={() =>
              setLocalFilters({ ...localFilters, dateFrom: '', dateTo: '' })
            }
            className='text-bg-primary text-sm font-medium cursor-pointer'
          >
            Reset
          </button>
        </div>
        <div className='flex items-center space-x-3'>
          <div>
            <label className='block text-xs text-gray-500 mb-1'>From:</label>
            <input
              type='date'
              value={localFilters.dateFrom}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, dateFrom: e.target.value })
              }
              className='border border-gray-300 rounded-md py-2 px-3 text-sm w-full outline-none'
            />
          </div>
          <div>
            <label className='block text-xs text-gray-500 mb-1'>To:</label>
            <input
              type='date'
              value={localFilters.dateTo}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, dateTo: e.target.value })
              }
              className='border border-gray-300 rounded-md py-2 px-3 text-sm w-full outline-none'
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <label className='block text-base text-gray-600'>Status</label>
          <button
            onClick={() => setLocalFilters({ ...localFilters, status: '' })}
            className='text-bg-primary text-sm font-medium cursor-pointer'
          >
            Reset
          </button>
        </div>
        <select
          value={localFilters.status}
          onChange={(e) =>
            setLocalFilters({ ...localFilters, status: e.target.value })
          }
          className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3'
        >
          <option value=''>All</option>
          <option value='Scheduled'>Scheduled</option>
          <option value='In Progress'>In Progress</option>
          <option value='Completed'>Completed</option>
          <option value='Canceled'>Canceled</option>
        </select>
      </div>

      {/* Priority */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <label className='block text-base text-gray-600'>Priority</label>
          <button
            onClick={() => setLocalFilters({ ...localFilters, priority: '' })}
            className='text-bg-primary text-sm font-medium cursor-pointer'
          >
            Reset
          </button>
        </div>
        <select
          value={localFilters.priority}
          onChange={(e) =>
            setLocalFilters({ ...localFilters, priority: e.target.value })
          }
          className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3'
        >
          <option value=''>All</option>
          <option value='High'>High</option>
          <option value='Medium'>Medium</option>
          <option value='Low'>Low</option>
        </select>
      </div>

      {/* Actions */}
      <div className='flex justify-end items-center space-x-3'>
        <ButtonIcon name='Reset all' handleBtnClick={resetAllFilters} />
        <CustomButton title='Apply now' handleBtnClick={applyFilters} />
      </div>
    </div>
  );
};

export default JobFilterModal;
