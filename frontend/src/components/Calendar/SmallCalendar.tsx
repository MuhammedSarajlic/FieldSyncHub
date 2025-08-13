import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const SmallCalendar = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1);
  };

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust for Monday start

    const days = [];

    const numDaysInPrevMonth = getDaysInMonth(year, month - 1);
    for (let i = 0; i < startDayOfWeek; i++) {
      days.unshift({
        date: new Date(year, month - 1, numDaysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    const numDaysInCurrentMonth = getDaysInMonth(year, month);
    for (let i = 1; i <= numDaysInCurrentMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    let nextMonthDay = 1;
    while (days.length % 7 !== 0 || days.length < 35) {
      days.push({
        date: new Date(year, month + 1, nextMonthDay),
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    return days;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  return (
    <div className='absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-20 w-80'>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className='p-1 hover:bg-gray-100 rounded'
        >
          <ChevronLeft className='w-4 h-4' />
        </button>
        <span className='font-medium'>
          {currentMonth.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className='p-1 hover:bg-gray-100 rounded'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-2'>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
          <div
            key={day}
            className='text-center text-xs font-medium text-gray-500 py-1'
          >
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.slice(0, 35).map((day, index) => (
          <button
            key={index}
            onClick={() => {
              onDateSelect(day.date);
              onClose();
            }}
            className={`
              p-1 text-xs rounded hover:bg-gray-100
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${
                day.date.toDateString() === selectedDate.toDateString()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : ''
              }
              ${
                day.date.toDateString() === new Date().toDateString()
                  ? 'font-bold'
                  : ''
              }
            `}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmallCalendar;
