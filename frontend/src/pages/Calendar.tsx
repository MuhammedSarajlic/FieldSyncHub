import { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Event categories with their styling
const EVENT_CATEGORIES = {
  job: {
    name: 'Job',
    colors: 'bg-emerald-500 text-white',
    hoverColors: 'hover:bg-emerald-600',
    leftBorder: 'border-l-4 border-emerald-700',
  },
  appointment: {
    name: 'Appointment',
    colors: 'bg-indigo-500 text-white',
    hoverColors: 'hover:bg-indigo-600',
    leftBorder: 'border-l-4 border-indigo-700',
  },
  event: {
    name: 'Event',
    colors: 'bg-amber-500 text-white',
    hoverColors: 'hover:bg-amber-600',
    leftBorder: 'border-l-4 border-amber-700',
  },
  timeoff: {
    name: 'Time Off',
    colors: 'bg-rose-500 text-white',
    hoverColors: 'hover:bg-rose-600',
    leftBorder: 'border-l-4 border-rose-700',
  },
  block: {
    name: 'Block',
    colors: 'bg-slate-500 text-white',
    hoverColors: 'hover:bg-slate-600',
    leftBorder: 'border-l-4 border-slate-700',
  },
  reminder: {
    name: 'Reminder',
    colors: 'bg-orange-500 text-white',
    hoverColors: 'hover:bg-orange-600',
    leftBorder: 'border-l-4 border-orange-700',
  },
};

// Sample events data - replace with your actual data
const sampleEvents = [
  {
    id: 1,
    title: 'HVAC Installation',
    category: 'job',
    date: new Date(),
    time: '9:00 AM',
    customer: 'John Smith',
  },
  {
    id: 2,
    title: 'Estimate Meeting',
    category: 'appointment',
    date: new Date(),
    time: '2:00 PM',
    customer: 'Sarah Johnson',
  },
  {
    id: 3,
    title: 'Team Meeting',
    category: 'event',
    date: new Date(),
    time: '10:00 AM',
  },
  {
    id: 4,
    title: 'Invoice Reminder',
    category: 'reminder',
    date: new Date(),
    time: 'Auto',
    automated: true,
  },
];

// Function to get events for a specific date
const getEventsForDate = (date, events) => {
  return events.filter(
    (event) => event.date.toDateString() === date.toDateString()
  );
};

// Event component
const CalendarEvent = ({ event, onClick }) => {
  const category = EVENT_CATEGORIES[event.category];

  return (
    <div
      className={`
        ${category.colors} ${category.hoverColors} ${category.leftBorder}
        py-1.5 px-2 font-medium cursor-pointer
        text-xs transition-all duration-200 shadow-sm
        ${event.automated ? 'opacity-80' : ''}
      `}
      onClick={() => onClick(event)}
      title={`${event.title} ${event.time ? `- ${event.time}` : ''}`}
    >
      <div className='flex items-center justify-between'>
        <span className='font-semibold truncate flex-1'>{event.title}</span>
        {event.time && (
          <span className='text-xs opacity-90 ml-1 flex-shrink-0'>
            {event.time}
          </span>
        )}
      </div>
      {/* {event.customer && (
        <div className='text-xs opacity-90 mt-0.5 truncate'>
          {event.customer}
        </div>
      )} */}
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Function to get the number of days in a specific month and year
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get the first day of the month (Date object)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1);
  };

  // Function to generate all days for the calendar grid
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const numDaysInCurrentMonth = getDaysInMonth(year, month);

    // Day of the week for the 1st of the month (0=Sunday, 1=Monday, ..., 6=Saturday)
    let startDayOfWeek = firstDayOfMonth.getDay();
    // Adjust to make Monday (1) the start of the week. If Sunday (0), it becomes 6.
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    // Add days from the previous month
    const numDaysInPrevMonth = getDaysInMonth(year, month - 1);
    for (let i = 0; i < startDayOfWeek; i++) {
      days.unshift({
        date: new Date(year, month - 1, numDaysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Add days from the current month
    for (let i = 1; i <= numDaysInCurrentMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add days from the next month to fill the grid (ensure 6 full weeks or less if needed)
    let nextMonthDay = 1;
    while (days.length % 7 !== 0 || days.length < 35) {
      // Ensure at least 5 rows (35 days)
      days.push({
        date: new Date(year, month + 1, nextMonthDay),
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);

  // Helper to format the current month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-semibold text-gray-800'>
              My Calendar
            </h1>
            <button>Add event</button>
          </div>

          <div className='flex justify-between items-center mb-6'>
            <div className='text-xl font-medium text-gray-700'>
              {formatMonthYear(currentDate)}
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={goToPreviousMonth}
                className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors'
              >
                &lt;
              </button>
              <button
                onClick={goToNextMonth}
                className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors'
              >
                &gt;
              </button>
              <select
                name='view'
                id='view-select'
                className='p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='month'>Month</option>
                <option value='week'>Week</option>
                <option value='day'>Day</option>
                <option value='day'>Dispatch</option>
              </select>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className='w-full flex items-start'>
            <div className='w-5/6 rounded-lg border border-gray-200'>
              <div className='grid grid-cols-7 border-b-3 border-gray-200 divide-x divide-gray-200 rounded-t-lg'>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className='text-center py-3 text-sm font-medium text-gray-600'
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 divide-x divide-y divide-gray-200'>
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date, sampleEvents);

                  return (
                    <div
                      key={index}
                      className={`
                        px-2 pt-2 h-42 flex flex-col justify-between
                        ${
                          day.isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400 bg-gray-50'
                        }
                        ${
                          day.date.toDateString() === new Date().toDateString()
                            ? 'bg-bg-primary/20'
                            : ''
                        }
                      `}
                    >
                      <div
                        className={`text-left text-sm font-semibold mb-1.5 ${
                          day.date.toDateString() === new Date().toDateString()
                            ? 'text-bg-primary'
                            : ''
                        }`}
                      >
                        {day.date.getDate()}
                      </div>

                      {/* Events container */}
                      <div className='flex-grow text-xs overflow-hidden space-y-1'>
                        {dayEvents.slice(0, 3).map((event) => (
                          <CalendarEvent
                            key={event.id}
                            event={event}
                            onClick={(event) => {
                              // Handle event click - open modal, navigate, etc.
                              console.log('Event clicked:', event);
                            }}
                          />
                        ))}

                        {/* Show "X more" if there are more than 3 events */}
                        {dayEvents.length > 3 && (
                          <div className='text-gray-500 text-xs px-1.5 py-1 cursor-pointer hover:text-gray-700'>
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className='w-1/6'>Unscheudled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
