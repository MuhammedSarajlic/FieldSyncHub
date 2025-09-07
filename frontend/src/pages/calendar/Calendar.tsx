import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Map,
  Search,
  X,
  CalendarX,
  Plus,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import CustomButton from '../../components/CustomElements/Buttons/CustomButton';
import IconButton from '../../components/CustomElements/Buttons/IconButton';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet library
import CalendarEvent from '../../components/Calendar/CalendarEvent';
import UnscheduledJob from '../../components/Calendar/UnscheduledJob';
import CreateCalendarEventModal from '../../components/Calendar/CreateCalendarEventModal';
import SmallCalendar from '../../components/Calendar/SmallCalendar';
import CustomDropdown from '../../components/Calendar/CustomDropdown';
import {
  formatMonthYear,
  getCurrentGMTPlusOffset,
  getDaysForWeek,
} from '../../utils/CalendarHelpers';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import { useClickOutside } from '../../hooks/useClickOutside';
import CustomCheckbox from '../../components/CustomElements/Checkbox/CustomCheckbox';
import CreateEventModal from '../../components/Calendar/CreateEventModal';
import { GetEventsByWorkspace } from '../../services/Event';
import { useAuth } from '../../context/AuthProvider';
import NewJobModal from '../../components/Jobs/JobsModal/NewJobModal';
import { GetCalendarEventsByWorkspaceAndDateRange } from '../../services/Calendar';
import { TCalendarEvents } from '../../types/Calendar';
import { TJob } from '../../types/Job';
import { TEvent } from '../../types/Event';
import { TLead } from '../../types/Lead';

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

const HOURS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${ampm}`;
});

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
    coords: [40.7128, -74.006],
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
    coords: [34.0522, -118.2437],
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
    coords: [41.8781, -87.6298],
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
    coords: [29.7604, -95.3698],
  },
  {
    id: 8,
    title: 'Emergency Repair',
    category: 'job',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time: '11:00 AM',
    customer: 'Alice Wonderland',
    location: '777 Fantasy Ln',
    priority: 'High',
    employeeId: 'emp2',
    coords: [33.4484, -112.074],
  },
  {
    id: 9,
    title: 'Routine Check-up',
    category: 'appointment',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    time: '3:00 PM',
    customer: 'Bob The Builder',
    location: 'Construction Site',
    priority: 'Low',
    employeeId: 'emp1',
    coords: [39.9526, -75.1652],
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

// Function to get events for a specific date
const getCalendarEventsForDate = (date, items: TJob[] | TEvent[] | TLead[]) => {
  return items.filter((item) => {
    const eventDate = new Date(item.startDateTime).toLocaleDateString();
    const selectedDate = date.toLocaleDateString();
    return eventDate === selectedDate;
  });
};

// Function to get events for a specific date and employee
const getEventsForDateAndEmployee = (date, employeeId, events) => {
  return events.filter(
    (event) =>
      event.date.toDateString() === date.toDateString() &&
      event.employeeId === employeeId
  );
};

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('Month'); // 'Month', 'Week', 'Day', 'Dispatch'
  const [isCalendarView, setIsCalendarView] = useState(true); // Toggles between Calendar and Map
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(false); // Controls unscheduled jobs sidebar visibility
  const [unscheduledSearch, setUnscheduledSearch] = useState('');
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState<TCalendarEvents>({
    events: [],
    jobs: [],
    leads: [],
  });
  const [isCalendarEventModalOpen, setIsCalendarEventModalOpen] =
    useState<boolean>(false);
  const [
    createCalendarEventModalPosition,
    setCreateCalendarEventModalPosition,
  ] = useState({
    x: 0,
    y: 0,
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const calendarEventModalRef = useClickOutside<HTMLDivElement>(() =>
    setIsCalendarEventModalOpen(false)
  );

  const handleCalendarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return;

    const calendarRect = calendarRef.current.getBoundingClientRect();
    const modalWidth = 200;
    const modalHeight = 165;

    const relativeX = e.clientX - calendarRect.left;
    const relativeY = e.clientY - calendarRect.top;

    let posX = relativeX;
    let posY = relativeY;

    if (posX + modalWidth > calendarRect.width) posX -= modalWidth;

    if (posY + modalHeight > calendarRect.height) posY -= modalHeight;

    setCreateCalendarEventModalPosition({
      x: posX,
      y: posY,
    });
    setIsCalendarEventModalOpen(true);
  };

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

  const getEventType = (item, calendarEvents) => {
    if (calendarEvents.events?.some((event) => event.id === item.id))
      return 'event';
    if (calendarEvents.jobs?.some((job) => job.id === item.id)) return 'job';
    if (calendarEvents.leads?.some((lead) => lead.id === item.id))
      return 'lead';
    return 'event'; // fallback
  };

  // Filter unscheduled jobs based on search
  const filteredUnscheduledJobs = unscheduledJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
      job.customer.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
      job.location.toLowerCase().includes(unscheduledSearch.toLowerCase())
  );

  const fetchCalendarEvents = async () => {
    if (!user?.workspace) return;

    let startDate, endDate;

    // Determine date range based on selected view
    if (selectedView === 'Month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else if (selectedView === 'Week') {
      const weekDays = getDaysForWeek(currentDate);
      startDate = weekDays[0];
      endDate = weekDays[6];
    } else if (selectedView === 'Day' || selectedView === 'Dispatch') {
      startDate = new Date(currentDate);
      endDate = new Date(currentDate);
    }

    const response = await GetCalendarEventsByWorkspaceAndDateRange(
      user.workspace.id,
      startDate,
      endDate
    );
    if (response.status === 200) {
      console.log(response.data);

      setCalendarEvents(response.data);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, selectedView]);

  useEffect(() => {
    let currentMapInstance = null;

    if (!isCalendarView) {
      currentMapInstance = L.map('map-container').setView(
        [44.20169, 17.90397],
        6
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
        currentMapInstance
      );

      setMapInstance(currentMapInstance);
    }

    return () => {
      if (currentMapInstance) {
        currentMapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [isCalendarView]);

  const renderCalendarView = () => {
    if (selectedView === 'Month') {
      return (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
          <div className='grid grid-cols-7 border-b-3 border-gray-200 divide-x divide-gray-200 rounded-t-lg'>
            {DAYS.map((day) => (
              <div
                key={day}
                className='text-center py-3 text-sm font-semibold text-text-primary'
              >
                {day}
              </div>
            ))}
          </div>
          <div
            ref={calendarRef}
            onClick={(e) => handleCalendarClick(e)}
            className='relative divide-y divide-gray-200'
          >
            {[0, 1, 2, 3, 4, 5].map((weekIndex) => (
              <div
                key={weekIndex}
                className='grid grid-cols-7 divide-x divide-gray-200'
              >
                {calendarDays
                  .slice(weekIndex * 7, weekIndex * 7 + 7)
                  .map((day, index) => {
                    // Get events, jobs, and leads for this day
                    const dayEvents = getCalendarEventsForDate(
                      day.date,
                      calendarEvents.events || []
                    );
                    const dayJobs = getCalendarEventsForDate(
                      day.date,
                      calendarEvents.jobs || []
                    );
                    const dayLeads = getCalendarEventsForDate(
                      day.date,
                      calendarEvents.leads || []
                    );

                    // Combine all items for this day
                    const allDayItems = [...dayEvents, ...dayJobs, ...dayLeads];

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDay(day.date)}
                        className={`px-2 pt-2 h-40 flex flex-col justify-between
                        ${
                          day.isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400 bg-gray-50'
                        }
                        ${
                          day.date.toDateString() === new Date().toDateString()
                            ? 'bg-blue-50'
                            : +selectedDay == +day.date
                            ? 'bg-bg-primary/20'
                            : ''
                        }
                        ${+selectedDay == +day.date && 'bg-bg-primary/20'}
                        `}
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
                          {allDayItems.slice(0, 3).map((item) => (
                            <CalendarEvent
                              key={item.id}
                              event={item}
                              eventType={getEventType(item, calendarEvents)}
                              onClick={(e, event) => {
                                e.stopPropagation();
                                console.log('Event clicked:', item);
                              }}
                            />
                          ))}

                          {allDayItems.length > 3 && (
                            <div className='text-gray-500 text-xs px-1.5 py-1 cursor-pointer hover:text-gray-700'>
                              +{allDayItems.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
            <CreateCalendarEventModal
              ref={calendarEventModalRef}
              isOpen={isCalendarEventModalOpen}
              onClose={() => setIsCalendarEventModalOpen(false)}
              createCalendarEventModalPosition={
                createCalendarEventModalPosition
              }
              setIsCreateEventModalOpen={setIsCreateEventModalOpen}
              setIsCreateJobModalOpen={setIsCreateJobModalOpen}
            />
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
        <div className='w-full max-w-full flex rounded-lg border border-gray-200'>
          <div className='w-1/10 overflow-x-scroll'>
            <div className='min-h-[53px] text-center border-b py-4 text-sm font-medium text-gray-600 flex items-center justify-center border-r border-gray-200 flex-shrink-0'>
              {' '}
              {/* Changed border-b-[3px] to border-b and added border-r for consistency */}
              Employee
            </div>
            <div className='divide-y divide-gray-200'>
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className='py-4 px-2 text-sm font-medium text-gray-700 flex items-center border-r border-gray-200 flex-shrink-0'
                >
                  {employee.name}
                </div>
              ))}
            </div>
          </div>
          <div className='w-9/10 flex-1 overflow-x-scroll'>
            {/* Added border-b to this flex container for a single, consistent bottom border under all hours */}
            <div className='flex '>
              {HOURS.map((hour, index) => (
                <div
                  key={index}
                  // Changed border-b-[3px] to border-b for consistent thickness
                  // Added border-r to ensure last column has a right border
                  className='border-b min-w-[100px] text-center py-4 text-sm font-medium text-gray-600 border-r border-gray-200'
                >
                  {hour}
                </div>
              ))}
            </div>
            {/* Content rows: Employee Name | Events for hours (scrollable) */}
            {/* <div className=''> */}
            {employees.map((employee) => (
              <div key={employee.id} className='flex'>
                {' '}
                {/* Removed extra space here */}
                <div className='flex-1'>
                  {' '}
                  {/* Removed extra space here */}
                  {/* Added border-b to each employee's event row to ensure horizontal separation */}
                  <div className='grid grid-flow-col auto-cols-[minmax(100px,1fr)] divide-x divide-gray-200 border-b border-gray-200'>
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
                          // Added border-r to ensure last column has a right border
                          // Changed min-h from 60px back to 53px as per your current code
                          className={`px-2 py-2 flex flex-col justify-start items-start min-h-[52px] overflow-hidden border-r border-gray-200`}
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
      <div className='overflow-hidden flex-1 ml-64'>
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
                    <SmallCalendar
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
                isCalendarView={isCalendarView}
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
                  {/* Map Container is now conditionally rendered inside this div */}
                  <div
                    id='map-container'
                    style={{ height: '700px', width: '100%' }}
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
      <NewJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        setJobs={() => {}}
        selectedDay={selectedDay}
      />
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        selectedDay={selectedDay}
      />
    </div>
  );
};

export default Calendar;
