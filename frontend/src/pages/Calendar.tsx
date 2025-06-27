import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import PageUnderDevelopment from '../components/CustomElements/PageUnderDevelopment';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    technicians: [],
    status: 'all',
    jobType: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Temporary data for the calendar view
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'HVAC Repair',
      client: 'Johnson Residence',
      address: '425 Oak Street, Springfield',
      date: new Date(2025, 4, 5, 9, 0), // May 5, 2025, 9:00 AM
      endTime: new Date(2025, 4, 5, 11, 0), // May 5, 2025, 11:00 AM
      status: 'scheduled',
      technician: 'Mike Wilson',
      jobType: 'repair',
      priority: 'high',
      notes: 'Client reported unusual noise from the unit',
    },
    {
      id: 2,
      title: 'Plumbing Installation',
      client: 'Greenview Apartments',
      address: '782 Main St, Springfield',
      date: new Date(2025, 4, 5, 13, 0), // May 5, 2025, 1:00 PM
      endTime: new Date(2025, 4, 5, 17, 0), // May 5, 2025, 5:00 PM
      status: 'scheduled',
      technician: 'Sarah Lee',
      jobType: 'installation',
      priority: 'medium',
      notes: 'New bathroom fixtures installation',
    },
    {
      id: 3,
      title: 'Electrical Inspection',
      client: 'Smith Office Building',
      address: '123 Business Park, Springfield',
      date: new Date(2025, 4, 6, 10, 0), // May 6, 2025, 10:00 AM
      endTime: new Date(2025, 4, 6, 12, 0), // May 6, 2025, 12:00 PM
      status: 'pending',
      technician: 'John Davis',
      jobType: 'inspection',
      priority: 'medium',
      notes: 'Annual electrical safety inspection',
    },
    {
      id: 4,
      title: 'Roof Repair',
      client: 'Community Center',
      address: '56 Central Ave, Springfield',
      date: new Date(2025, 4, 7, 8, 0), // May 7, 2025, 8:00 AM
      endTime: new Date(2025, 4, 7, 16, 0), // May 7, 2025, 4:00 PM
      status: 'scheduled',
      technician: 'Mike Wilson',
      jobType: 'repair',
      priority: 'high',
      notes: 'Roof leak after recent storm',
    },
    {
      id: 5,
      title: 'Water Heater Installation',
      client: 'Peterson Residence',
      address: '890 Elm Street, Springfield',
      date: new Date(2025, 4, 8, 13, 0), // May 8, 2025, 1:00 PM
      endTime: new Date(2025, 4, 8, 16, 0), // May 8, 2025, 4:00 PM
      status: 'scheduled',
      technician: 'Sarah Lee',
      jobType: 'installation',
      priority: 'medium',
      notes: 'Replacing old unit with new energy-efficient model',
    },
  ]);

  // Temporary data for technicians
  const technicians = [
    { id: 1, name: 'Mike Wilson', specialty: 'HVAC, Roofing' },
    { id: 2, name: 'Sarah Lee', specialty: 'Plumbing, Installation' },
    { id: 3, name: 'John Davis', specialty: 'Electrical, Inspection' },
    { id: 4, name: 'Lisa Johnson', specialty: 'General Maintenance' },
  ];

  // Function to handle job submission
  const handleJobSubmit = (e) => {
    e.preventDefault();
    // Logic to save job would go here
    setShowJobForm(false);
  };

  // Function to get all dates in a week
  const getDatesInWeek = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start of the week (Sunday)

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  // Function to get days in the current month for month view
  const getDaysInMonth = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the first day of the week for the first day of the month
    const startOffset = firstDay.getDay();

    // Get total days needed (up to 6 weeks * 7 days)
    const daysArray = [];

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      daysArray.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Add all days in the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i));
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - daysArray.length; // 6 weeks * 7 days = 42 total cells
    for (let i = 1; i <= remainingDays; i++) {
      daysArray.push(new Date(year, month + 1, i));
    }

    return daysArray;
  };

  // Function to navigate to previous/next period
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);

    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7 * direction);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }

    setCurrentDate(newDate);
  };

  // Function to filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesTechnician =
      filterOptions.technicians.length === 0 ||
      filterOptions.technicians.includes(job.technician);
    const matchesStatus =
      filterOptions.status === 'all' || job.status === filterOptions.status;
    const matchesJobType =
      filterOptions.jobType === 'all' || job.jobType === filterOptions.jobType;
    const matchesSearch =
      searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesTechnician && matchesStatus && matchesJobType && matchesSearch
    );
  });

  // Helper to format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to check if a job is on a specific date
  const isJobOnDate = (job, date) => {
    return (
      job.date.getDate() === date.getDate() &&
      job.date.getMonth() === date.getMonth() &&
      job.date.getFullYear() === date.getFullYear()
    );
  };

  // Helper to get jobs for a specific date
  const getJobsForDate = (date) => {
    return filteredJobs.filter((job) => isJobOnDate(job, date));
  };

  // Function to format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Function to get month name
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const [isConstruction, setIsConstruction] = useState<boolean>(true);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />

        {!isConstruction ? (
          <div className='p-6'>
            {/* Header with controls */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>
                  Schedule & Calendar
                </h1>
                <p className='text-gray-600'>
                  Manage your team's appointments and jobs
                </p>
              </div>

              <div className='flex flex-wrap items-center gap-2 mt-4 md:mt-0'>
                <div className='flex bg-gray-100 rounded-md'>
                  <button
                    onClick={() => setView('day')}
                    className={`px-3 py-1 text-sm rounded-l-md ${
                      view === 'day'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1 text-sm ${
                      view === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1 text-sm rounded-r-md ${
                      view === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    Month
                  </button>
                </div>

                <button
                  onClick={() => setShowJobForm(true)}
                  className='flex items-center bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700'
                >
                  <Plus size={16} className='mr-1' />
                  Schedule Job
                </button>
              </div>
            </div>

            <div className='flex flex-col lg:flex-row gap-6'>
              {/* Main calendar area */}
              <div className='lg:w-3/4'>
                {/* Calendar navigation */}
                <div className='bg-white p-4 shadow rounded-lg mb-6'>
                  <div className='flex justify-between items-center'>
                    <button
                      onClick={() => navigateDate(-1)}
                      className='p-1 rounded-full hover:bg-gray-100'
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className='flex items-center'>
                      <CalendarIcon size={20} className='mr-2 text-blue-600' />
                      {view === 'day' && (
                        <h2 className='text-lg font-medium'>
                          {formatDate(currentDate)}
                        </h2>
                      )}
                      {view === 'week' && (
                        <h2 className='text-lg font-medium'>
                          {formatDate(getDatesInWeek(currentDate)[0])} -{' '}
                          {formatDate(getDatesInWeek(currentDate)[6])}
                        </h2>
                      )}
                      {view === 'month' && (
                        <h2 className='text-lg font-medium'>
                          {getMonthName(currentDate)}
                        </h2>
                      )}
                    </div>

                    <button
                      onClick={() => navigateDate(1)}
                      className='p-1 rounded-full hover:bg-gray-100'
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Day View */}
                {view === 'day' && (
                  <div className='bg-white shadow rounded-lg overflow-hidden'>
                    <div className='p-4 border-b'>
                      <h3 className='font-medium text-gray-800'>
                        {formatDate(currentDate)}
                      </h3>
                    </div>

                    <div className='divide-y'>
                      {/* Time slots - simplified for this example */}
                      {Array.from({ length: 12 }, (_, i) => i + 8).map(
                        (hour) => {
                          const timeSlot = new Date(currentDate);
                          timeSlot.setHours(hour, 0, 0);

                          const jobsInSlot = filteredJobs.filter(
                            (job) =>
                              job.date.getDate() === timeSlot.getDate() &&
                              job.date.getMonth() === timeSlot.getMonth() &&
                              job.date.getFullYear() ===
                                timeSlot.getFullYear() &&
                              job.date.getHours() === hour
                          );

                          return (
                            <div key={hour} className='flex p-2 min-h-16'>
                              <div className='w-16 py-2 flex justify-center border-r text-gray-500'>
                                {hour > 12
                                  ? `${hour - 12}:00 PM`
                                  : `${hour}:00 AM`}
                              </div>
                              <div className='flex-1 pl-4 py-2'>
                                {jobsInSlot.length > 0 ? (
                                  <div className='space-y-2'>
                                    {jobsInSlot.map((job) => (
                                      <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`p-2 rounded cursor-pointer ${
                                          job.priority === 'high'
                                            ? 'bg-red-100 border-l-4 border-red-500'
                                            : job.priority === 'medium'
                                            ? 'bg-yellow-100 border-l-4 border-yellow-500'
                                            : 'bg-blue-100 border-l-4 border-blue-500'
                                        }`}
                                      >
                                        <div className='flex justify-between'>
                                          <p className='font-medium'>
                                            {job.title}
                                          </p>
                                          <p className='text-sm text-gray-600'>
                                            {formatTime(job.date)} -{' '}
                                            {formatTime(job.endTime)}
                                          </p>
                                        </div>
                                        <p className='text-sm'>{job.client}</p>
                                        <div className='flex items-center mt-1 text-xs text-gray-500'>
                                          <User size={12} className='mr-1' />
                                          {job.technician}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className='h-full flex items-center justify-center text-gray-400 text-sm'>
                                    No appointments scheduled
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Week View */}
                {view === 'week' && (
                  <div className='bg-white shadow rounded-lg overflow-hidden'>
                    <div className='grid grid-cols-7 border-b'>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (day, index) => (
                          <div key={day} className='p-3 text-center'>
                            <p className='text-sm font-medium text-gray-600'>
                              {day}
                            </p>
                            <p
                              className={`mt-1 text-lg ${
                                getDatesInWeek(currentDate)[
                                  index
                                ].toDateString() === new Date().toDateString()
                                  ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                                  : ''
                              }`}
                            >
                              {getDatesInWeek(currentDate)[index].getDate()}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    <div className='grid grid-cols-7 divide-x h-full'>
                      {getDatesInWeek(currentDate).map((date, index) => {
                        const dayJobs = getJobsForDate(date);

                        return (
                          <div key={index} className='min-h-64 p-2'>
                            {dayJobs.length > 0 ? (
                              <div className='space-y-2'>
                                {dayJobs.map((job) => (
                                  <div
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className={`p-2 rounded cursor-pointer text-sm ${
                                      job.priority === 'high'
                                        ? 'bg-red-100 border-l-2 border-red-500'
                                        : job.priority === 'medium'
                                        ? 'bg-yellow-100 border-l-2 border-yellow-500'
                                        : 'bg-blue-100 border-l-2 border-blue-500'
                                    }`}
                                  >
                                    <p className='font-medium truncate'>
                                      {job.title}
                                    </p>
                                    <p className='text-xs truncate'>
                                      {job.client}
                                    </p>
                                    <p className='text-xs text-gray-600'>
                                      {formatTime(job.date)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className='h-full flex items-center justify-center text-gray-400 text-xs'>
                                No jobs
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Month View */}
                {view === 'month' && (
                  <div className='bg-white shadow rounded-lg overflow-hidden'>
                    <div className='grid grid-cols-7 border-b'>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (day) => (
                          <div key={day} className='p-2 text-center'>
                            <p className='text-sm font-medium text-gray-600'>
                              {day}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    <div className='grid grid-cols-7 divide-x divide-y'>
                      {getDaysInMonth(currentDate).map((date, index) => {
                        const isCurrentMonth =
                          date.getMonth() === currentDate.getMonth();
                        const isToday =
                          date.toDateString() === new Date().toDateString();
                        const dayJobs = getJobsForDate(date);

                        return (
                          <div
                            key={index}
                            className={`min-h-24 p-1 ${
                              isCurrentMonth ? '' : 'bg-gray-50'
                            }`}
                          >
                            <div className='flex justify-between'>
                              <p
                                className={`text-sm p-1 ${
                                  isToday
                                    ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                                    : !isCurrentMonth
                                    ? 'text-gray-400'
                                    : ''
                                }`}
                              >
                                {date.getDate()}
                              </p>
                              {dayJobs.length > 0 && (
                                <span className='text-xs bg-blue-100 text-blue-800 px-1 rounded'>
                                  {dayJobs.length}
                                </span>
                              )}
                            </div>

                            <div className='mt-1'>
                              {dayJobs.slice(0, 2).map((job) => (
                                <div
                                  key={job.id}
                                  onClick={() => setSelectedJob(job)}
                                  className={`p-1 mb-1 rounded cursor-pointer text-xs truncate ${
                                    job.priority === 'high'
                                      ? 'bg-red-100 border-l-2 border-red-500'
                                      : job.priority === 'medium'
                                      ? 'bg-yellow-100 border-l-2 border-yellow-500'
                                      : 'bg-blue-100 border-l-2 border-blue-500'
                                  }`}
                                >
                                  {job.title}
                                </div>
                              ))}
                              {dayJobs.length > 2 && (
                                <p className='text-xs text-gray-500 pl-1'>
                                  +{dayJobs.length - 2} more
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar with filters and upcoming jobs */}
              <div className='lg:w-1/4'>
                {/* Search and filter */}
                <div className='bg-white p-4 shadow rounded-lg mb-6'>
                  <div className='relative mb-4'>
                    <input
                      type='text'
                      placeholder='Search jobs...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <Search
                      size={16}
                      className='absolute left-3 top-3 text-gray-400'
                    />
                  </div>

                  <div className='mb-4'>
                    <div className='flex items-center mb-2'>
                      <Filter size={16} className='mr-1 text-gray-500' />
                      <h3 className='text-sm font-medium text-gray-700'>
                        Filters
                      </h3>
                    </div>

                    <div className='mb-3'>
                      <label className='block text-xs text-gray-600 mb-1'>
                        Technicians
                      </label>
                      <div className='space-y-1'>
                        {technicians.map((tech) => (
                          <div key={tech.id} className='flex items-center'>
                            <input
                              type='checkbox'
                              id={`tech-${tech.id}`}
                              checked={filterOptions.technicians.includes(
                                tech.name
                              )}
                              onChange={() => {
                                setFilterOptions((prev) => {
                                  if (prev.technicians.includes(tech.name)) {
                                    return {
                                      ...prev,
                                      technicians: prev.technicians.filter(
                                        (t) => t !== tech.name
                                      ),
                                    };
                                  } else {
                                    return {
                                      ...prev,
                                      technicians: [
                                        ...prev.technicians,
                                        tech.name,
                                      ],
                                    };
                                  }
                                });
                              }}
                              className='mr-2'
                            />
                            <label
                              htmlFor={`tech-${tech.id}`}
                              className='text-sm'
                            >
                              {tech.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label className='block text-xs text-gray-600 mb-1'>
                        Status
                      </label>
                      <select
                        value={filterOptions.status}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className='w-full p-2 border rounded-md text-sm'
                      >
                        <option value='all'>All Statuses</option>
                        <option value='scheduled'>Scheduled</option>
                        <option value='pending'>Pending</option>
                        <option value='in-progress'>In Progress</option>
                        <option value='completed'>Completed</option>
                        <option value='cancelled'>Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs text-gray-600 mb-1'>
                        Job Type
                      </label>
                      <select
                        value={filterOptions.jobType}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            jobType: e.target.value,
                          }))
                        }
                        className='w-full p-2 border rounded-md text-sm'
                      >
                        <option value='all'>All Types</option>
                        <option value='repair'>Repair</option>
                        <option value='installation'>Installation</option>
                        <option value='maintenance'>Maintenance</option>
                        <option value='inspection'>Inspection</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setFilterOptions({
                        technicians: [],
                        status: 'all',
                        jobType: 'all',
                      })
                    }
                    className='text-blue-600 text-sm hover:underline w-full text-center'
                  >
                    Reset Filters
                  </button>
                </div>

                {/* Upcoming Jobs */}
                <div className='bg-white p-4 shadow rounded-lg'>
                  <h3 className='text-md font-medium text-gray-800 mb-3'>
                    Upcoming Jobs
                  </h3>

                  <div className='space-y-3'>
                    {filteredJobs
                      .filter((job) => new Date(job.date) >= new Date())
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .slice(0, 3)
                      .map((job) => (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className='p-3 bg-gray-50 rounded-md cursor-pointer'
                        >
                          <div className='flex justify-between items-start'>
                            <div>
                              <h4 className='font-medium text-gray-800'>
                                {job.title}
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {job.client}
                              </p>
                            </div>
                            <div
                              className={`px-2 py-1 text-xs rounded-full ${
                                job.status === 'scheduled'
                                  ? 'bg-green-100 text-green-800'
                                  : job.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {job.status.charAt(0).toUpperCase() +
                                job.status.slice(1)}
                            </div>
                          </div>

                          <div className='mt-2 text-xs text-gray-500 flex items-center'>
                            <Clock size={12} className='mr-1' />
                            {formatDate(job.date)} • {formatTime(job.date)}
                          </div>

                          <div className='mt-1 text-xs text-gray-500 flex items-center'>
                            <User size={12} className='mr-1' />
                            {job.technician}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PageUnderDevelopment />
        )}

        {/* Job details modal */}
        {selectedJob && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg max-w-md w-full'>
              <div className='p-4 border-b flex justify-between items-center'>
                <h3 className='font-medium text-lg'>Job Details</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className='p-1 hover:bg-gray-100 rounded-full'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='p-4'>
                <h2 className='text-xl font-bold'>{selectedJob.title}</h2>

                <div className='mt-4 space-y-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Client</p>
                    <p className='font-medium'>{selectedJob.client}</p>
                  </div>

                  <div>
                    <p className='text-sm text-gray-500'>Address</p>
                    <div className='flex items-start'>
                      <MapPin size={16} className='mt-1 mr-1 text-gray-400' />
                      <p>{selectedJob.address}</p>
                    </div>
                  </div>

                  <div className='flex space-x-6'>
                    <div>
                      <p className='text-sm text-gray-500'>Date</p>
                      <p>{formatDate(selectedJob.date)}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Time</p>
                      <p>
                        {formatTime(selectedJob.date)} -{' '}
                        {formatTime(selectedJob.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className='flex space-x-6'>
                    <div>
                      <p className='text-sm text-gray-500'>Status</p>
                      <div
                        className={`mt-1 px-2 py-1 text-xs inline-block rounded-full ${
                          selectedJob.status === 'scheduled'
                            ? 'bg-green-100 text-green-800'
                            : selectedJob.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedJob.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedJob.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedJob.status.charAt(0).toUpperCase() +
                          selectedJob.status.slice(1)}
                      </div>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Priority</p>
                      <div
                        className={`mt-1 px-2 py-1 text-xs inline-block rounded-full ${
                          selectedJob.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : selectedJob.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedJob.priority.charAt(0).toUpperCase() +
                          selectedJob.priority.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className='text-sm text-gray-500'>Technician</p>
                    <div className='flex items-center'>
                      <User size={16} className='mr-1 text-gray-400' />
                      <p>{selectedJob.technician}</p>
                    </div>
                  </div>

                  <div>
                    <p className='text-sm text-gray-500'>Notes</p>
                    <p className='bg-gray-50 p-2 rounded'>
                      {selectedJob.notes}
                    </p>
                  </div>
                </div>
              </div>

              <div className='p-4 border-t flex justify-end space-x-2'>
                <button
                  onClick={() => setSelectedJob(null)}
                  className='px-4 py-2 border rounded-md hover:bg-gray-50'
                >
                  Close
                </button>
                <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule job form modal */}
        {showJobForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg max-w-lg w-full'>
              <div className='p-4 border-b flex justify-between items-center'>
                <h3 className='font-medium text-lg'>Schedule New Job</h3>
                <button
                  onClick={() => setShowJobForm(false)}
                  className='p-1 hover:bg-gray-100 rounded-full'
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleJobSubmit} className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Job Title
                    </label>
                    <input
                      type='text'
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Client
                    </label>
                    <input
                      type='text'
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Address
                    </label>
                    <input
                      type='text'
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Date
                    </label>
                    <input
                      type='date'
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Time
                    </label>
                    <input
                      type='time'
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      End Time
                    </label>
                    <input
                      type='time'
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Technician
                    </label>
                    <select
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Technician</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.name}>
                          {tech.name} - {tech.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Job Type
                    </label>
                    <select
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Type</option>
                      <option value='repair'>Repair</option>
                      <option value='installation'>Installation</option>
                      <option value='maintenance'>Maintenance</option>
                      <option value='inspection'>Inspection</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Priority
                    </label>
                    <select
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select Priority</option>
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Status
                    </label>
                    <select
                      required
                      className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='scheduled'>Scheduled</option>
                      <option value='pending'>Pending</option>
                    </select>
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Notes
                    </label>
                    <textarea className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24'></textarea>
                  </div>
                </div>

                <div className='mt-6 flex justify-end space-x-2'>
                  <button
                    type='button'
                    onClick={() => setShowJobForm(false)}
                    className='px-4 py-2 border rounded-md hover:bg-gray-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                  >
                    Schedule Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
