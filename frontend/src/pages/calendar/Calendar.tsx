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
} from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import CustomButton from '../../components/CustomElements/Buttons/CustomButton';
import IconButton from '../../components/CustomElements/Buttons/IconButton';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CalendarEvent from '../../components/Calendar/CalendarEvent';
import CreateCalendarEventModal from '../../components/Calendar/CreateCalendarEventModal';
import SmallCalendar from '../../components/Calendar/SmallCalendar';
import CustomDropdown from '../../components/Calendar/CustomDropdown';
import {
  formatMonthYear,
  getCurrentGMTPlusOffset,
  getDaysForWeek,
  startOfDay,
  endOfDay,
} from '../../utils/CalendarHelpers';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import { useClickOutside } from '../../hooks/useClickOutside';
import CreateEventModal from '../../components/Calendar/CreateEventModal';
import { useAuth } from '../../context/AuthProvider';
import NewJobModal from '../../components/Jobs/JobsModal/NewJobModal';
import { GetCalendarEventsByWorkspaceAndDateRange } from '../../services/Calendar';
import { GetEmployeesByWorkspace } from '../../services/Employee';
import { TCalendarEvents } from '../../types/Calendar';
import { TJob } from '../../types/Job';
import { TEvent } from '../../types/Event';
import { TLead } from '../../types/Lead';
import { TEmployee } from '../../types/Employee';

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

// Function to get events for a specific date
const getCalendarEventsForDate = (
  date: Date,
  items: TJob[] | TEvent[] | TLead[]
) => {
  return items.filter((item) => {
    if (item.startDateTime === undefined) return false;
    const eventDate = new Date(item.startDateTime).toLocaleDateString();
    const selectedDate = date.toLocaleDateString();
    return eventDate === selectedDate;
  });
};

// Function to get events/jobs/leads for a specific date and hour (used by Week/Day views)
const getItemsForDateAndHour = (
  date: Date,
  hour: number,
  items: (TJob | TEvent | TLead)[]
) => {
  return items.filter((item) => {
    if (!item.startDateTime) return false;
    const itemDate = new Date(item.startDateTime);
    return (
      itemDate.toDateString() === date.toDateString() &&
      itemDate.getHours() === hour
    );
  });
};

// Function to get jobs/events assigned to a specific employee for a date and hour (Dispatch view)
const getAssignedItemsForEmployeeAndHour = (
  date: Date,
  hour: number,
  employeeId: string,
  jobs: TJob[],
  events: TEvent[]
) => {
  const matchingJobs = jobs.filter((job) => {
    if (!job.startDateTime) return false;
    const jobDate = new Date(job.startDateTime);
    return (
      jobDate.toDateString() === date.toDateString() &&
      jobDate.getHours() === hour &&
      job.assignedTeamMembers?.some((emp) => emp.id === employeeId)
    );
  });
  const matchingEvents = events.filter((event) => {
    if (!event.startDateTime) return false;
    const eventDate = new Date(event.startDateTime);
    return (
      eventDate.toDateString() === date.toDateString() &&
      eventDate.getHours() === hour &&
      event.assignedTo?.some((emp) => emp.id === employeeId)
    );
  });
  return [...matchingJobs, ...matchingEvents];
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
  const [_, setMapInstance] = useState(null);
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
  const [selectedDay, setSelectedDay] = useState<null | Date>(null);
  const [employees, setEmployees] = useState<TEmployee[]>([]);

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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1);
  };

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

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

  const getEventType = (
    item: TEvent | TJob | TLead,
    calendarEvents: TCalendarEvents
  ) => {
    if (calendarEvents.events?.some((event) => event.id === item.id))
      return 'event';
    if (calendarEvents.jobs?.some((job) => job.id === item.id)) return 'job';
    if (calendarEvents.leads?.some((lead) => lead.id === item.id))
      return 'lead';
    return 'event';
  };

  // const filteredUnscheduledJobs = unscheduledJobs.filter(
  //   (job) =>
  //     job.title.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
  //     job.customer.toLowerCase().includes(unscheduledSearch.toLowerCase()) ||
  //     job.location.toLowerCase().includes(unscheduledSearch.toLowerCase())
  // );

  const fetchCalendarEvents = async () => {
    if (!user?.workspace) return;

    let startDate: Date;
    let endDate: Date;

    if (selectedView === 'Month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      startDate = startOfDay(new Date(year, month, 1));
      endDate = endOfDay(new Date(year, month + 1, 0));
    } else if (selectedView === 'Week') {
      const weekDays = getDaysForWeek(currentDate);
      startDate = startOfDay(weekDays[0]);
      endDate = endOfDay(weekDays[6]);
    } else if (selectedView === 'Day' || selectedView === 'Dispatch') {
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
    } else {
      console.error('Invalid selectedView or currentDate');
      return;
    }

    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    const response = await GetCalendarEventsByWorkspaceAndDateRange(
      user.workspace.id,
      formattedStartDate,
      formattedEndDate
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
    const fetchEmployees = async () => {
      if (!user?.workspace) return;
      const response = await GetEmployeesByWorkspace(user.workspace.id);
      if (response.status === 200) {
        setEmployees(response.data.payload || []);
      }
    };
    fetchEmployees();
  }, [user?.workspace]);

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
                            : selectedDay && +selectedDay == +day.date
                            ? 'bg-bg-primary/20'
                            : ''
                        }
                        ${
                          selectedDay &&
                          +selectedDay == +day.date &&
                          'bg-bg-primary/20'
                        }
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
                              onClick={(e) => {
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
      const allItems = [
        ...(calendarEvents.events || []),
        ...(calendarEvents.jobs || []),
        ...(calendarEvents.leads || []),
      ];
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
                {DAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                <br />
                <span className='text-xs font-normal'>
                  {day.getDate()}/{day.getMonth() + 1}
                </span>
              </div>
            ))}
          </div>
          <div className='divide-y divide-gray-200'>
            {HOURS.map((hourLabel, hourIndex) => {
              const hour = hourIndex + 6;
              return (
                <div
                  key={hourIndex}
                  className='grid grid-cols-[96px_repeat(7,1fr)] divide-x divide-gray-200 min-h-[60px]'
                >
                  <div className='py-2 px-2 text-xs font-medium text-gray-500 flex items-center justify-end border-r border-gray-200'>
                    {hourLabel}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const itemsInSlot = getItemsForDateAndHour(
                      day,
                      hour,
                      allItems
                    );

                    return (
                      <div
                        key={dayIndex}
                        className={`px-2 py-2 flex flex-col gap-1 justify-start items-start
                          ${
                            day.toDateString() === new Date().toDateString()
                              ? 'bg-blue-50'
                              : ''
                          }`}
                      >
                        {itemsInSlot.map((item) => (
                          <CalendarEvent
                            key={item.id}
                            event={item}
                            eventType={getEventType(item, calendarEvents)}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Event clicked:', item);
                            }}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (selectedView === 'Day') {
      const today = currentDate;
      const allItems = [
        ...(calendarEvents.events || []),
        ...(calendarEvents.jobs || []),
        ...(calendarEvents.leads || []),
      ];
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
              {DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1]}
              <br />
              <span className='text-xs font-normal'>
                {today.getDate()}/{today.getMonth() + 1}/{today.getFullYear()}
              </span>
            </div>
          </div>
          <div className='divide-y divide-gray-200'>
            {HOURS.map((hourLabel, hourIndex) => {
              const hour = hourIndex + 6;
              const itemsInSlot = getItemsForDateAndHour(
                today,
                hour,
                allItems
              );

              return (
                <div
                  key={hourIndex}
                  className='grid grid-cols-[96px_1fr] divide-x divide-gray-200 min-h-[60px]'
                >
                  <div className='py-2 px-2 text-xs font-medium text-gray-500 flex items-center justify-end border-r border-gray-200'>
                    {hourLabel}
                  </div>
                  <div
                    className={`px-2 py-2 flex flex-col gap-1 justify-start items-start
                      ${
                        today.toDateString() === new Date().toDateString()
                          ? 'bg-blue-50'
                          : ''
                      }`}
                  >
                    {itemsInSlot.map((item) => (
                      <CalendarEvent
                        key={item.id}
                        event={item}
                        eventType={getEventType(item, calendarEvents)}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Event clicked:', item);
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else if (selectedView === 'Dispatch') {
      const currentDay = currentDate;
      const dispatchJobs = calendarEvents.jobs || [];
      const dispatchEvents = calendarEvents.events || [];

      return (
        <div className='w-full max-w-full flex rounded-lg border border-gray-200'>
          <div className='w-1/10 overflow-x-scroll'>
            <div className='min-h-[53px] text-center border-b py-4 text-sm font-medium text-gray-600 flex items-center justify-center border-r border-gray-200 flex-shrink-0'>
              Employee
            </div>
            <div className='divide-y divide-gray-200'>
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className='py-4 px-2 text-sm font-medium text-gray-700 flex items-center border-r border-gray-200 flex-shrink-0'
                >
                  {employee.user?.fullName || 'Unnamed'}
                </div>
              ))}
              {employees.length === 0 && (
                <div className='py-4 px-2 text-sm text-gray-400 text-center'>
                  No team members
                </div>
              )}
            </div>
          </div>
          <div className='w-9/10 flex-1 overflow-x-scroll'>
            <div className='flex'>
              {HOURS.map((hourLabel, index) => (
                <div
                  key={index}
                  className='border-b min-w-[100px] text-center py-4 text-sm font-medium text-gray-600 border-r border-gray-200'
                >
                  {hourLabel}
                </div>
              ))}
            </div>
            {employees.map((employee) => (
              <div key={employee.id} className='flex'>
                <div className='flex-1'>
                  <div className='grid grid-flow-col auto-cols-[minmax(100px,1fr)] divide-x divide-gray-200 border-b border-gray-200'>
                    {HOURS.map((_, hourIndex) => {
                      const hour = hourIndex + 6;
                      const itemsForSlot = getAssignedItemsForEmployeeAndHour(
                        currentDay,
                        hour,
                        employee.id,
                        dispatchJobs,
                        dispatchEvents
                      );

                      return (
                        <div
                          key={hourIndex}
                          className='px-2 py-2 flex flex-col gap-1 justify-start items-start min-h-[52px] overflow-hidden border-r border-gray-200'
                        >
                          {itemsForSlot.map((item) => (
                            <CalendarEvent
                              key={item.id}
                              event={item}
                              eventType={getEventType(item, calendarEvents)}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Event clicked:', item);
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
                {/* {filteredUnscheduledJobs.length > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                    {filteredUnscheduledJobs.length}
                  </span>
                )} */}
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
                    {/* ({filteredUnscheduledJobs.length}) */}
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
                  {/* {filteredUnscheduledJobs.map((job) => (
                    <UnscheduledJob
                      key={job.id}
                      job={job}
                      onClick={(job: TJob) => {
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
                  )} */}
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
