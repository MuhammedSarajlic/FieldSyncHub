import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Map,
  Search,
  X,
  CalendarX, // Added for unscheduled jobs icon
} from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import CustomButton from '../components/CustomElements/Buttons/CustomButton';
import IconButton from '../components/CustomElements/Buttons/IconButton';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet library

// Define the days of the week
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Define hours for week/day/dispatch views
const HOURS = Array.from({ length: 18 }, (_, i) => {
  // From 6 AM to 11 PM
  const hour = i + 6;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${ampm}`;
});

// Event categories with their styling
const EVENT_CATEGORIES = {
  job: {
    name: 'Job',
    colors: 'bg-bg-primary text-white',
    hoverColors: 'hover:bg-emerald-600',
    leftBorder: 'border-l-4 border-text-primary',
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

// Sample events data
const sampleEvents = [
  {
    id: 1,
    title: 'HVAC Installation',
    category: 'job',
    date: new Date(),
    time: '9:00 AM',
    customer: 'John Smith',
    location: '123 Main St',
    priority: 'High',
    employeeId: 'emp1',
    coords: [40.7128, -74.006], // New York City
  },
  {
    id: 2,
    title: 'Estimate Meeting',
    category: 'appointment',
    date: new Date(),
    time: '2:00 PM',
    customer: 'Sarah Johnson',
    location: '456 Oak Ave',
    priority: 'Medium',
    employeeId: 'emp2',
    coords: [34.0522, -118.2437], // Los Angeles
  },
  {
    id: 3,
    title: 'Team Meeting',
    category: 'event',
    date: new Date(),
    time: '10:00 AM',
    location: 'Office',
    priority: 'Low',
    employeeId: 'emp1',
    coords: [41.8781, -87.6298], // Chicago
  },
  {
    id: 4,
    title: 'Invoice Reminder',
    category: 'reminder',
    date: new Date(),
    time: 'Auto',
    automated: true,
    priority: 'Medium',
    employeeId: 'emp3',
    coords: [29.7604, -95.3698], // Houston
  },
  {
    id: 8,
    title: 'Emergency Repair',
    category: 'job',
    date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    time: '11:00 AM',
    customer: 'Alice Wonderland',
    location: '777 Fantasy Ln',
    priority: 'High',
    employeeId: 'emp2',
    coords: [33.4484, -112.074], // Phoenix
  },
  {
    id: 9,
    title: 'Routine Check-up',
    category: 'appointment',
    date: new Date(new Date().setDate(new Date().getDate() - 2)), // Two days ago
    time: '3:00 PM',
    customer: 'Bob The Builder',
    location: 'Construction Site',
    priority: 'Low',
    employeeId: 'emp1',
    coords: [39.9526, -75.1652], // Philadelphia
  },
];

// Unscheduled jobs
const unscheduledJobs = [
  {
    id: 5,
    title: 'Plumbing Repair',
    category: 'job',
    customer: 'Mike Davis',
    location: '789 Pine St',
    priority: 'High',
    estimatedDuration: '3 hours',
  },
  {
    id: 6,
    title: 'AC Maintenance',
    category: 'job',
    customer: 'Lisa Brown',
    location: '321 Elm St',
    priority: 'Medium',
    estimatedDuration: '2 hours',
  },
  {
    id: 7,
    title: 'Electrical Check',
    category: 'job',
    customer: 'Tom Wilson',
    location: '654 Maple Ave',
    priority: 'Low',
    estimatedDuration: '1 hour',
  },
];

// Sample Employee Data for Dispatch View
const employees = [
  { id: 'emp1', name: 'Alice Johnson' },
  { id: 'emp2', name: 'Bob Williams' },
  { id: 'emp3', name: 'Charlie Brown' },
  { id: 'emp4', name: 'Diana Prince' },
];

// Custom Dropdown Component
const CustomDropdown = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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
                onChange(option);
                setIsOpen(false);
              }}
              className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg'
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mini Calendar Component
const MiniCalendar = ({ selectedDate, onDateSelect, onClose }) => {
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

// Unscheduled Job Component
const UnscheduledJob = ({ job, onClick }) => {
  const category = EVENT_CATEGORIES[job.category];

  return (
    <div
      className={`
        ${category.colors} ${category.hoverColors} ${category.leftBorder}
        p-2 font-medium cursor-pointer
        text-sm transition-all duration-200 shadow-sm mb-2 rounded-md
      `}
      onClick={() => onClick(job)}
    >
      <div className='font-semibold truncate flex-1'>{job.title}</div>
      <div className='text-xs opacity-90'>{job.customer}</div>
    </div>
  );
};

// Function to get events for a specific date
const getEventsForDate = (date, events) => {
  return events.filter(
    (event) => event.date.toDateString() === date.toDateString()
  );
};

// Function to get events for a specific date and employee
const getEventsForDateAndEmployee = (date, employeeId, events) => {
  return events.filter(
    (event) =>
      event.date.toDateString() === date.toDateString() &&
      event.employeeId === employeeId
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
        text-xs transition-all duration-200 shadow-sm rounded-md
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
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('Month'); // 'Month', 'Week', 'Day', 'Dispatch'
  const [isCalendarView, setIsCalendarView] = useState(true); // Toggles between Calendar and Map
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(false); // Controls unscheduled jobs sidebar visibility
  const [unscheduledSearch, setUnscheduledSearch] = useState('');
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [mapInstance, setMapInstance] = useState(null); // State to hold the Leaflet map instance

  // Function to get the number of days in a specific month and year
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get the first day of the month (Date object)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1);
  };

  // Function to generate all days for the calendar grid (Month View)
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust to make Monday (1) the start of the week.

    const days = [];

    // Add days from the previous month
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

    // Add days from the next month to fill the grid (ensure 6 full weeks or less if needed)
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

  const calendarDays = generateCalendarDays(currentDate);

  // Helper to format the current month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  // Helper to format date as "Month Day, Year"
  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper to get the start of the week (Monday) for a given date
  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  // Helper to get days for the current week
  const getDaysForWeek = (date) => {
    const startOfWeek = getStartOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  // Helper to get current GMT offset
  const getCurrentGMTPlusOffset = () => {
    const date = new Date();
    const offsetMinutes = date.getTimezoneOffset(); // Offset in minutes from UTC
    const offsetHours = -offsetMinutes / 60; // Convert to hours, negate because getTimezoneOffset is UTC-local
    const sign = offsetHours >= 0 ? '+' : '-';
    const absOffsetHours = Math.abs(Math.floor(offsetHours));
    const absOffsetMinutes = Math.abs(offsetMinutes % 60);

    const formattedOffset = `GMT${sign}${String(absOffsetHours).padStart(
      2,
      '0'
    )}:${String(absOffsetMinutes).padStart(2, '0')}`;
    return formattedOffset;
  };

  const goToPrevious = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (selectedView === 'Month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (selectedView === 'Week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (selectedView === 'Day' || selectedView === 'Dispatch') {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (selectedView === 'Month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (selectedView === 'Week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (selectedView === 'Day' || selectedView === 'Dispatch') {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter unscheduled jobs based on search
  const filteredUnscheduledJobs = unscheduledJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
      job.customer.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
      job.location.toLowerCase().includes(unscheduledSearch.toLowerCase())
  );

  // Effect for Leaflet Map Initialization
  useEffect(() => {
    if (!isCalendarView) {
      // Only initialize map if Map view is active
      if (mapInstance) {
        mapInstance.remove(); // Clean up existing map instance
      }

      // Initialize the map
      const newMap = L.map('map-container').setView([39.8283, -98.5795], 4); // Centered on USA

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(newMap);

      setMapInstance(newMap);

      return () => {
        // Cleanup function: remove map when component unmounts or view changes
        newMap.remove();
        setMapInstance(null);
      };
    } else {
      if (mapInstance) {
        mapInstance.remove(); // Remove map if switching back to calendar view
        setMapInstance(null);
      }
    }
  }, [isCalendarView]); // Re-run effect when isCalendarView changes

  // Render logic for different views
  const renderCalendarView = () => {
    if (selectedView === 'Month') {
      return (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
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
          <div className='divide-y divide-gray-200'>
            {[0, 1, 2, 3, 4, 5].map((weekIndex) => (
              <div
                key={weekIndex}
                className='grid grid-cols-7 divide-x divide-gray-200'
              >
                {calendarDays
                  .slice(weekIndex * 7, weekIndex * 7 + 7)
                  .map((day, index) => {
                    const dayEvents = getEventsForDate(day.date, sampleEvents);

                    return (
                      <div
                        key={index}
                        className={`px-2 pt-2 h-40 flex flex-col justify-between
                          ${
                            day.isCurrentMonth
                              ? 'text-gray-900'
                              : 'text-gray-400 bg-gray-50'
                          }
                          ${
                            day.date.toDateString() ===
                            new Date().toDateString()
                              ? 'bg-blue-50'
                              : ''
                          }`}
                      >
                        <div
                          className={`text-left text-sm font-semibold mb-1.5 ${
                            day.date.toDateString() ===
                            new Date().toDateString()
                              ? 'text-blue-600'
                              : ''
                          }`}
                        >
                          {day.date.getDate()}
                        </div>

                        <div className='flex-grow text-xs overflow-hidden space-y-1'>
                          {dayEvents.slice(0, 3).map((event) => (
                            <CalendarEvent
                              key={event.id}
                              event={event}
                              onClick={(event) => {
                                console.log('Event clicked:', event);
                              }}
                            />
                          ))}

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
            ))}
          </div>
        </div>
      );
    } else if (selectedView === 'Week') {
      const weekDays = getDaysForWeek(currentDate);
      return (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
          <div className='grid grid-cols-[96px_repeat(7,1fr)] border-b-3 border-gray-200 divide-x divide-gray-200 rounded-t-lg'>
            {/* Hour column header with timezone */}
            <div className='text-center py-3 text-sm font-medium text-gray-600 flex items-center justify-center'>
              {getCurrentGMTPlusOffset()}
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`text-center py-3 text-sm font-medium ${
                  day.toDateString() === new Date().toDateString()
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {DAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]}{' '}
                {/* Adjust for Monday start */}
                <br />
                <span className='text-xs font-normal'>
                  {day.getDate()}/{day.getMonth() + 1}
                </span>
              </div>
            ))}
          </div>
          <div className='divide-y divide-gray-200'>
            {HOURS.map((hour, hourIndex) => (
              <div
                key={hourIndex}
                className='grid grid-cols-[96px_repeat(7,1fr)] divide-x divide-gray-200 min-h-[60px]'
              >
                <div className='py-2 px-2 text-xs font-medium text-gray-500 flex items-center justify-end border-r border-gray-200'>
                  {hour}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const hourStart = parseInt(hour.split(':')[0]);
                  const ampm = hour.split(' ')[1];
                  const currentHour =
                    ampm === 'PM' && hourStart !== 12
                      ? hourStart + 12
                      : hourStart;

                  const eventsInSlot = sampleEvents.filter((event) => {
                    const eventDate = new Date(event.date);
                    const eventHour = parseInt(event.time.split(':')[0]);
                    const eventAmpm = event.time.split(' ')[1];
                    const eventFullHour =
                      eventAmpm === 'PM' && eventHour !== 12
                        ? eventHour + 12
                        : eventHour;

                    return (
                      eventDate.toDateString() === day.toDateString() &&
                      eventFullHour === currentHour
                    );
                  });

                  return (
                    <div
                      key={dayIndex}
                      className={`px-2 py-2 flex flex-col justify-start items-start
                        ${
                          day.toDateString() === new Date().toDateString()
                            ? 'bg-blue-50'
                            : ''
                        }`}
                    >
                      {eventsInSlot.map((event) => (
                        <CalendarEvent
                          key={event.id}
                          event={event}
                          onClick={(event) => {
                            console.log('Event clicked:', event);
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (selectedView === 'Day') {
      const today = currentDate;
      return (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
          <div className='grid grid-cols-[96px_1fr] border-b-3 border-gray-200 divide-x divide-gray-200 rounded-t-lg'>
            {/* Hour column header with timezone */}
            <div className='text-center py-3 text-sm font-medium text-gray-600 flex items-center justify-center'>
              {getCurrentGMTPlusOffset()}
            </div>
            <div
              className={`text-center py-3 text-sm font-medium ${
                today.toDateString() === new Date().toDateString()
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1]}{' '}
              {/* Adjust for Monday start */}
              <br />
              <span className='text-xs font-normal'>
                {today.getDate()}/{today.getMonth() + 1}/{today.getFullYear()}
              </span>
            </div>
          </div>
          <div className='divide-y divide-gray-200'>
            {HOURS.map((hour, hourIndex) => (
              <div
                key={hourIndex}
                className='grid grid-cols-[96px_1fr] divide-x divide-gray-200 min-h-[60px]'
              >
                <div className='py-2 px-2 text-xs font-medium text-gray-500 flex items-center justify-end border-r border-gray-200'>
                  {hour}
                </div>
                <div
                  className={`px-2 py-2 flex flex-col justify-start items-start
                    ${
                      today.toDateString() === new Date().toDateString()
                        ? 'bg-blue-50'
                        : ''
                    }`}
                >
                  {sampleEvents
                    .filter((event) => {
                      const eventDate = new Date(event.date);
                      const eventHour = parseInt(event.time.split(':')[0]);
                      const eventAmpm = event.time.split(' ')[1];
                      const eventFullHour =
                        eventAmpm === 'PM' && eventHour !== 12
                          ? eventHour + 12
                          : eventHour;

                      return (
                        eventDate.toDateString() === today.toDateString() &&
                        eventFullHour === parseInt(hour.split(':')[0])
                      );
                    })
                    .map((event) => (
                      <CalendarEvent
                        key={event.id}
                        event={event}
                        onClick={(event) => {
                          console.log('Event clicked:', event);
                        }}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (selectedView === 'Dispatch') {
      const currentDay = currentDate; // Only one day for dispatch view
      return (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
          {/* Header row: Employee | Hours (scrollable) */}
          <div className='flex border-b-3 border-gray-200 rounded-t-lg'>
            <div className='w-[160px] text-center py-3 text-sm font-medium text-gray-600 flex items-center justify-center border-r border-gray-200 flex-shrink-0'>
              Employee
            </div>
            <div className='flex-1 overflow-x-auto'>
              {' '}
              {/* This will scroll horizontally */}
              <div className='grid grid-flow-col auto-cols-[minmax(100px,1fr)] divide-x divide-gray-200'>
                {HOURS.map((hour, index) => (
                  <div
                    key={index}
                    className='text-center py-3 text-sm font-medium text-gray-600'
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content rows: Employee Name | Events for hours (scrollable) */}
          <div className='divide-y divide-gray-200'>
            {employees.map((employee) => (
              <div key={employee.id} className='flex'>
                <div className='w-[160px] py-2 px-2 text-sm font-medium text-gray-700 flex items-center border-r border-gray-200 flex-shrink-0'>
                  {employee.name}
                </div>
                <div className='flex-1 overflow-x-auto'>
                  {' '}
                  {/* This will scroll horizontally */}
                  <div className='grid grid-flow-col auto-cols-[minmax(100px,1fr)] divide-x divide-gray-200'>
                    {HOURS.map((hour, hourIndex) => {
                      const hourStart = parseInt(hour.split(':')[0]);
                      const ampm = hour.split(' ')[1];
                      const currentHour =
                        ampm === 'PM' && hourStart !== 12
                          ? hourStart + 12
                          : hourStart;

                      const eventsForEmployeeAndHour = sampleEvents.filter(
                        (event) => {
                          const eventDate = new Date(event.date);
                          const eventHour = parseInt(event.time.split(':')[0]);
                          const eventAmpm = event.time.split(' ')[1];
                          const eventFullHour =
                            eventAmpm === 'PM' && eventHour !== 12
                              ? eventHour + 12
                              : eventHour;

                          return (
                            eventDate.toDateString() ===
                              currentDay.toDateString() &&
                            event.employeeId === employee.id &&
                            eventFullHour === currentHour
                          );
                        }
                      );
                      return (
                        <div
                          key={hourIndex}
                          className={`px-2 py-2 flex flex-col justify-start items-start min-h-[60px]
                            ${
                              currentDay.toDateString() ===
                              new Date().toDateString()
                                ? 'bg-blue-50'
                                : ''
                            }`}
                        >
                          {eventsForEmployeeAndHour.map((event) => (
                            <CalendarEvent
                              key={event.id}
                              event={event}
                              onClick={(event) => {
                                console.log('Event clicked:', event);
                              }}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center space-x-4'>
              {/* Date navigation with arrows and dropdown */}
              <div className='flex items-center space-x-3'>
                <IconButton
                  icon={<ChevronLeft className='w-5 h-5 text-gray-600' />}
                  onClick={goToPrevious}
                  customStyle='py-2.5 px-2!'
                />
                <IconButton
                  icon={<ChevronRight className='w-5 h-5 text-gray-600' />}
                  onClick={goToNext}
                  customStyle='py-2.5 px-2!'
                />
                <div className='relative'>
                  <IconButton
                    icon={
                      <ChevronDown className='w-4 h-4 text-gray-600 ml-2' />
                    }
                    onClick={() => setShowMiniCalendar(!showMiniCalendar)}
                    iconPosition='right'
                    customStyle='py-2.5 font-semibold'
                  >
                    {selectedView === 'Month'
                      ? formatMonthYear(currentDate)
                      : selectedView === 'Week'
                      ? `${formatDate(
                          getDaysForWeek(currentDate)[0]
                        )} - ${formatDate(getDaysForWeek(currentDate)[6])}`
                      : formatDate(currentDate)}
                  </IconButton>

                  {showMiniCalendar && (
                    <MiniCalendar
                      selectedDate={currentDate}
                      onDateSelect={setCurrentDate}
                      onClose={() => setShowMiniCalendar(false)}
                    />
                  )}
                </div>
              </div>

              {/* Today Button */}
              <CustomButton
                onClick={goToToday}
                customStyle='px-4 py-2.5 font-semibold text-text-primary'
              >
                Today
              </CustomButton>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Calendar/Map View Toggle */}
              <div className='flex items-center bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setIsCalendarView(true)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isCalendarView ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <CalendarIcon className='w-4 h-4' />
                  <span className='text-sm font-medium'>Calendar</span>
                </button>
                <button
                  onClick={() => setIsCalendarView(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    !isCalendarView ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Map className='w-4 h-4' />
                  <span className='text-sm font-medium'>Map</span>
                </button>
              </div>

              {/* Custom View Dropdown */}
              <CustomDropdown
                value={selectedView}
                options={['Month', 'Week', 'Day', 'Dispatch']}
                onChange={setSelectedView}
              />

              {/* Unscheduled Jobs Icon */}
              <button
                onClick={() => setIsUnscheduledOpen(!isUnscheduledOpen)}
                className='relative p-2 rounded-full hover:bg-gray-200 transition-colors'
                title='Unscheduled Jobs'
              >
                <CalendarX className='w-5 h-5 text-gray-600' />
                {filteredUnscheduledJobs.length > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                    {filteredUnscheduledJobs.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Main Content Area (Calendar Grid or Map) and Unscheduled Jobs Sidebar */}
          <div className='flex'>
            <div
              className={`transition-all duration-300 ${
                isUnscheduledOpen ? 'w-5/6 pr-4' : 'w-full'
              }`}
            >
              {isCalendarView ? (
                renderCalendarView()
              ) : (
                <div className='rounded-lg border border-gray-200 overflow-hidden'>
                  {/* Map Container */}
                  <div
                    id='map-container'
                    style={{ height: '600px', width: '100%' }}
                  ></div>
                </div>
              )}
            </div>

            {/* Unscheduled Jobs Section */}
            <div
              className={`transition-all duration-300 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0
                ${isUnscheduledOpen ? 'w-1/6' : 'w-0 hidden'}`}
            >
              <div className='flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200'>
                <h3 className='font-medium text-text-primary flex items-center'>
                  Unscheduled jobs{' '}
                  <span className='ml-2 text-gray-500 text-sm'>
                    ({filteredUnscheduledJobs.length})
                  </span>
                </h3>
                <button
                  onClick={() => setIsUnscheduledOpen(false)}
                  className='p-1 hover:bg-gray-200 rounded cursor-pointer'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>

              <div className='p-3'>
                {/* Search Bar */}
                <div className='relative mb-4'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search jobs...'
                    value={unscheduledSearch}
                    onChange={(e) => setUnscheduledSearch(e.target.value)}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary text-sm'
                  />
                </div>

                {/* Unscheduled Jobs List */}
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {filteredUnscheduledJobs.map((job) => (
                    <UnscheduledJob
                      key={job.id}
                      job={job}
                      onClick={(job) => {
                        console.log('Unscheduled job clicked:', job);
                      }}
                    />
                  ))}

                  {filteredUnscheduledJobs.length === 0 && (
                    <div className='text-center text-gray-500 text-sm py-4'>
                      {unscheduledSearch
                        ? 'No jobs found'
                        : 'No unscheduled jobs'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
