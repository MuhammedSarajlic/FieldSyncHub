import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const CustomDropdown = ({ value, options, onChange, isCalendarView }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isCalendarView && (value == 'Month' || value == 'Dispatch'))
      onChange('Week');
  }, [isCalendarView]);
  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='min-w-32 flex items-center justify-between space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary'
      >
        <span className='text-sm font-medium'>{value}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10'>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                if (
                  !isCalendarView &&
                  (option == 'Month' || option == 'Dispatch')
                )
                  return;
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm first:rounded-t-lg last:rounded-b-lg ${
                !isCalendarView && (option == 'Month' || option == 'Dispatch')
                  ? 'text-gray-400 cursor-auto'
                  : 'cursor-pointer hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
