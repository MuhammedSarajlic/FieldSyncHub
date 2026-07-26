import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import ButtonIcon from '../../CustomElements/ButtonIcon';

interface SortOption {
  id: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}

interface SortByProps {
  onApply?: (sortOptions: Record<string, string>) => void;
}

const JobsSortModal: React.FC<SortByProps> = ({ onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({
    date: 'descending',
    activity: 'a-z',
    name: 'a-z',
  });

  const sortOptions: SortOption[] = [
    {
      id: 'date',
      label: 'Date',
      options: [
        { value: 'ascending', label: 'Ascending' },
        { value: 'descending', label: 'Descending' },
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      options: [
        { value: 'a-z', label: 'A-Z' },
        { value: 'z-a', label: 'Z-A' },
      ],
    },
    {
      id: 'name',
      label: 'Name',
      options: [
        { value: 'a-z', label: 'A-Z' },
        { value: 'z-a', label: 'Z-A' },
      ],
    },
  ];

  const handleOptionChange = (categoryId: string, value: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [categoryId]: value,
    });
  };

  const handleReset = () => {
    setSelectedOptions({
      date: 'descending',
      activity: 'a-z',
      name: 'a-z',
    });
  };

  const handleApply = () => {
    onApply(selectedOptions);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <ButtonIcon
        name='Sort'
        customIcon={<ArrowUpDown className='w-4 h-4' />}
        handleBtnClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className='absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
          <div className='p-4 pb-0'>
            <h3 className='text-base font-medium text-gray-900 mb-3'>
              Sort by
            </h3>
          </div>

          <div className='divide-y divide-gray-200'>
            {sortOptions.map((category) => (
              <div key={category.id} className='p-4'>
                <h4 className='text-sm font-medium text-gray-700 mb-3'>
                  {category.label}
                </h4>
                <div className='space-y-2'>
                  {category.options.map((option) => (
                    <label key={option.value} className='flex items-center'>
                      <input
                        type='radio'
                        name={category.id}
                        value={option.value}
                        checked={selectedOptions[category.id] === option.value}
                        onChange={() =>
                          handleOptionChange(category.id, option.value)
                        }
                        className='w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className='p-4 bg-gray-50 flex justify-between rounded-b-md'>
            <button
              onClick={handleReset}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className='px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700'
            >
              Apply now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsSortModal;
