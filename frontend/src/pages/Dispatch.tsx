import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  AlertCircle,
  Truck,
  Filter,
  List,
  Map,
  CheckCircle,
  X,
  PhoneCall,
  MessageCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PlusCircle,
} from 'lucide-react';

const Dispatch = () => {
  const [viewMode, setViewMode] = useState('day');
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sample technicians data
  const technicians = [
    {
      id: 1,
      name: 'John Smith',
      status: 'available',
      skills: ['HVAC', 'Electrical'],
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      name: 'Maria Garcia',
      status: 'on_job',
      skills: ['Plumbing'],
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      id: 3,
      name: 'David Lee',
      status: 'driving',
      skills: ['HVAC', 'Plumbing'],
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      status: 'available',
      skills: ['Electrical'],
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    {
      id: 5,
      name: 'Michael Brown',
      status: 'on_break',
      skills: ['HVAC', 'Installation'],
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  ];

  // Sample jobs data
  const jobs = [
    {
      id: 101,
      customer: 'Robert Anderson',
      address: '123 Main St, Phoenix, AZ',
      type: 'Repair',
      description: 'AC not cooling',
      status: 'confirmed',
      tech_id: 1,
      start_time: '09:00',
      end_time: '10:30',
      priority: 'High',
      equipment: 'Lennox AC Unit',
      notes: 'Customer has service agreement',
    },
    {
      id: 102,
      customer: 'Jennifer Wilson',
      address: '456 Oak Ave, Phoenix, AZ',
      type: 'Maintenance',
      description: 'Annual HVAC Tune-up',
      status: 'in_progress',
      tech_id: 2,
      start_time: '09:00',
      end_time: '11:00',
      priority: 'Normal',
      equipment: 'Trane AC System',
      notes: 'Pet in house - please call before arrival',
    },
    {
      id: 103,
      customer: 'Thomas Moore',
      address: '789 Pine Blvd, Scottsdale, AZ',
      type: 'Installation',
      description: 'New water heater install',
      status: 'confirmed',
      tech_id: 3,
      start_time: '13:00',
      end_time: '16:00',
      priority: 'Normal',
      equipment: 'Rheem 50gal',
      notes: 'Needs old unit disposal',
    },
    {
      id: 104,
      customer: 'Lisa Zhang',
      address: '345 Cedar Ln, Mesa, AZ',
      type: 'Repair',
      description: 'Electrical short in kitchen',
      status: 'pending',
      tech_id: 4,
      start_time: '11:00',
      end_time: '12:30',
      priority: 'High',
      equipment: 'N/A',
      notes: 'Customer reports burning smell',
    },
    {
      id: 105,
      customer: 'Carlos Mendez',
      address: '567 Birch St, Phoenix, AZ',
      type: 'Maintenance',
      description: 'Replace air filters',
      status: 'completed',
      tech_id: 5,
      start_time: '08:00',
      end_time: '09:00',
      priority: 'Low',
      equipment: 'Carrier HVAC',
      notes: 'Use MERV-13 filters',
    },
  ];

  // Sample unassigned jobs
  const unassignedJobs = [
    {
      id: 106,
      customer: 'Emma Davis',
      address: '890 Maple Dr, Tempe, AZ',
      type: 'Repair',
      description: 'Leaking pipe under sink',
      status: 'pending',
      tech_id: null,
      priority: 'High',
      equipment: 'Plumbing',
      notes: 'Customer will be home after 12pm',
    },
    {
      id: 107,
      customer: 'James Wilson',
      address: '234 Elm St, Chandler, AZ',
      type: 'Installation',
      description: 'New thermostat setup',
      status: 'pending',
      tech_id: null,
      priority: 'Normal',
      equipment: 'Nest Thermostat',
      notes: 'Customer purchased unit, needs professional install',
    },
    {
      id: 108,
      customer: 'Patricia Johnson',
      address: '678 Aspen Rd, Phoenix, AZ',
      type: 'Repair',
      description: 'Furnace making loud noise',
      status: 'pending',
      tech_id: null,
      priority: 'High',
      equipment: 'Bryant Furnace',
      notes: 'Senior citizen, please prioritize',
    },
  ];

  // Time slots for the day view
  const timeSlots = [
    '8:00',
    '9:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Handle job click to show details
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-200 border-green-600 text-green-800';
      case 'pending':
        return 'bg-yellow-200 border-yellow-600 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-200 border-blue-600 text-blue-800';
      case 'completed':
        return 'bg-gray-200 border-gray-600 text-gray-800';
      case 'cancelled':
        return 'bg-red-200 border-red-600 text-red-800';
      default:
        return 'bg-gray-200 border-gray-600 text-gray-800';
    }
  };

  // Get tech status color and label
  const getTechStatus = (status) => {
    switch (status) {
      case 'available':
        return { color: 'bg-green-500', label: 'Available' };
      case 'on_job':
        return { color: 'bg-blue-500', label: 'On Job' };
      case 'on_break':
        return { color: 'bg-yellow-500', label: 'On Break' };
      case 'driving':
        return { color: 'bg-purple-500', label: 'Driving' };
      case 'offline':
        return { color: 'bg-gray-500', label: 'Offline' };
      default:
        return { color: 'bg-gray-500', label: 'Unknown' };
    }
  };

  // Calculate job position in grid
  const calculateJobPosition = (job) => {
    const start = parseInt(job.start_time.split(':')[0]);
    const end = parseInt(job.end_time.split(':')[0]);
    const startPos =
      (start - 8) * 60 + parseInt(job.start_time.split(':')[1] || 0);
    const duration =
      (end - start) * 60 +
      (parseInt(job.end_time.split(':')[1] || 0) -
        parseInt(job.start_time.split(':')[1] || 0));

    return {
      gridRowStart: job.tech_id,
      gridColumnStart: Math.floor(startPos / 15) + 1,
      gridColumnEnd: Math.floor((startPos + duration) / 15) + 1,
    };
  };

  // Date navigation
  const changeDate = (increment) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + increment);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + increment * 7);
    }
    setCurrentDate(newDate);
  };

  // Format current date display
  const formatDateDisplay = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', options);
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${weekEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    return currentDate.toLocaleDateString();
  };

  // Job detail modal
  const JobDetailModal = () => {
    if (!selectedJob) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl'>
          <div className='flex justify-between items-center p-4 border-b'>
            <h2 className='text-xl font-semibold'>
              {selectedJob.type} Job #{selectedJob.id}
            </h2>
            <button
              onClick={() => setShowJobDetail(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              <X size={20} />
            </button>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <h3 className='font-medium text-gray-700 mb-2'>
                  Customer Information
                </h3>
                <p className='text-gray-800 font-medium'>
                  {selectedJob.customer}
                </p>
                <p className='text-gray-600 text-sm mb-2'>
                  {selectedJob.address}
                </p>
                <div className='flex space-x-2 mb-4'>
                  <button className='flex items-center text-sm text-blue-600 hover:text-blue-800'>
                    <PhoneCall size={14} className='mr-1' /> Call
                  </button>
                  <button className='flex items-center text-sm text-blue-600 hover:text-blue-800'>
                    <MessageCircle size={14} className='mr-1' /> Text
                  </button>
                </div>

                <h3 className='font-medium text-gray-700 mb-2'>Job Details</h3>
                <div className='grid grid-cols-2 gap-2 text-sm mb-4'>
                  <div>
                    <span className='text-gray-500'>Type:</span>
                    <span className='ml-2 font-medium'>{selectedJob.type}</span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Priority:</span>
                    <span
                      className={`ml-2 font-medium ${
                        selectedJob.priority === 'High'
                          ? 'text-red-600'
                          : selectedJob.priority === 'Low'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {selectedJob.priority}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-500'>Start:</span>
                    <span className='ml-2 font-medium'>
                      {selectedJob.start_time}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-500'>End:</span>
                    <span className='ml-2 font-medium'>
                      {selectedJob.end_time}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-gray-500'>Equipment:</span>
                    <span className='ml-2 font-medium'>
                      {selectedJob.equipment}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-medium text-gray-700 mb-2'>Description</h3>
                <p className='text-gray-800 text-sm mb-4'>
                  {selectedJob.description}
                </p>

                <h3 className='font-medium text-gray-700 mb-2'>Notes</h3>
                <p className='text-gray-800 text-sm mb-4 bg-yellow-50 p-2 rounded'>
                  {selectedJob.notes}
                </p>

                <h3 className='font-medium text-gray-700 mb-2'>Status</h3>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedJob.status
                  )}`}
                >
                  {selectedJob.status.charAt(0).toUpperCase() +
                    selectedJob.status.slice(1).replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className='border-t mt-6 pt-4'>
              <h3 className='font-medium text-gray-700 mb-3'>Actions</h3>
              <div className='flex space-x-3'>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm'>
                  Reassign Technician
                </button>
                <button className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm'>
                  Reschedule
                </button>
                <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm'>
                  Send ETA to Customer
                </button>
                <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm'>
                  Cancel Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-[260px] flex flex-col'>
        <Navbar />
        <div className='p-6 overflow-y-auto flex-1 flex flex-col'>
          {/* Header section with actions and filters */}
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                Dispatch Board
              </h1>
              <p className='text-gray-600'>
                Manage technician schedules and job assignments
              </p>
            </div>
            <div className='flex space-x-3'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center'>
                <PlusCircle size={18} className='mr-2' />
                Add New Job
              </button>
              <select className='border border-gray-300 rounded px-3 py-2 bg-white'>
                <option>All Technicians</option>
                <option>Available Only</option>
                <option>HVAC Techs</option>
                <option>Plumbers</option>
                <option>Electricians</option>
              </select>
              <button className='bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded flex items-center'>
                <Filter size={16} className='mr-2' />
                Filters
              </button>
            </div>
          </div>

          {/* Date selector and view toggle */}
          <div className='flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-sm'>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => changeDate(-1)}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className='text-lg font-medium'>{formatDateDisplay()}</h2>
              <button
                onClick={() => changeDate(1)}
                className='p-1 rounded-full hover:bg-gray-100'
              >
                <ChevronRight size={20} />
              </button>
              <button className='ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium'>
                Today
              </button>
            </div>

            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'day'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'week'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'map'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Main dispatch board layout */}
          <div className='flex flex-1 space-x-4'>
            {/* Left panel - Technicians list */}
            <div className='w-64 bg-white rounded-lg shadow-sm overflow-hidden'>
              <div className='p-4 border-b border-gray-200'>
                <h3 className='font-medium'>Technicians</h3>
              </div>
              <div
                className='overflow-y-auto'
                style={{ maxHeight: 'calc(100vh - 240px)' }}
              >
                {technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className='p-3 border-b border-gray-100 hover:bg-gray-50'
                  >
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-9 w-9 rounded-full overflow-hidden'>
                        <img
                          src={tech.avatar}
                          alt={tech.name}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm font-medium text-gray-800'>
                          {tech.name}
                        </p>
                        <div className='flex items-center'>
                          <div
                            className={`mr-1.5 h-2 w-2 rounded-full ${
                              getTechStatus(tech.status).color
                            }`}
                          ></div>
                          <p className='text-xs text-gray-500'>
                            {getTechStatus(tech.status).label}
                          </p>
                        </div>
                      </div>
                      <div className='ml-auto'>
                        <button className='text-gray-400 hover:text-gray-600'>
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                    <div className='mt-1.5'>
                      <div className='flex flex-wrap gap-1'>
                        {tech.skills.map((skill, index) => (
                          <span
                            key={index}
                            className='px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Calendar View */}
            {viewMode === 'day' && (
              <div className='flex-1 bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='border-b border-gray-200'>
                  <div className='grid grid-cols-10 text-center border-b'>
                    <div className='p-2 border-r'></div>
                    {timeSlots.map((time, index) => (
                      <div
                        key={index}
                        className='p-2 text-sm font-medium text-gray-700 border-r'
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className='relative min-h-[500px]'
                  style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${technicians.length}, minmax(90px, auto))`,
                  }}
                >
                  {/* Job blocks */}
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleJobClick(job)}
                      className={`absolute cursor-pointer border-l-4 rounded px-2 py-1 ${getStatusColor(
                        job.status
                      )}`}
                      style={{
                        top: `${(job.tech_id - 1) * 90}px`,
                        left: `${
                          (((parseInt(job.start_time.split(':')[0]) - 8) * 60 +
                            parseInt(job.start_time.split(':')[1] || 0)) /
                            15) *
                          25
                        }px`,
                        width: `${
                          (((parseInt(job.end_time.split(':')[0]) -
                            parseInt(job.start_time.split(':')[0])) *
                            60 +
                            (parseInt(job.end_time.split(':')[1] || 0) -
                              parseInt(job.start_time.split(':')[1] || 0))) /
                            15) *
                          25
                        }px`,
                        height: '80px',
                      }}
                    >
                      <div className='text-xs font-medium truncate'>
                        {job.customer}
                      </div>
                      <div className='text-xs truncate'>{job.description}</div>
                      <div className='text-xs mt-1'>
                        {job.start_time} - {job.end_time}
                      </div>
                    </div>
                  ))}

                  {/* Technician row separators */}
                  {technicians.map((tech, index) => (
                    <div
                      key={tech.id}
                      className='border-b border-gray-100 relative'
                      style={{ gridRow: index + 1 }}
                    >
                      <div className='absolute left-0 top-0 h-full w-24 bg-gray-50 border-r border-gray-200 flex items-center justify-center'>
                        <div className='text-xs text-gray-500 font-medium'>
                          {tech.name}
                        </div>
                      </div>

                      {/* Time grid */}
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className='absolute border-r border-gray-100'
                          style={{
                            left: `${(i + 1) * 10}%`,
                            top: 0,
                            height: '100%',
                          }}
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simple placeholder for Week View */}
            {viewMode === 'week' && (
              <div className='flex-1 bg-white rounded-lg shadow-sm p-6 text-center text-gray-500'>
                Week view would show a 7-day calendar with jobs across the week
              </div>
            )}

            {/* Simple placeholder for Map View */}
            {viewMode === 'map' && (
              <div className='flex-1 bg-white rounded-lg shadow-sm p-6 text-center text-gray-500'>
                Map view would show tech locations and job sites on an
                interactive map
              </div>
            )}

            {/* Simple placeholder for List View */}
            {viewMode === 'list' && (
              <div className='flex-1 bg-white rounded-lg shadow-sm p-6'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Job
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Customer
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Time
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Type
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Technician
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {[...jobs, ...unassignedJobs].map((job) => (
                      <tr key={job.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          #{job.id}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {job.customer}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {job.start_time
                            ? `${job.start_time} - ${job.end_time}`
                            : 'Unscheduled'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {job.type}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {job.tech_id
                            ? technicians.find((t) => t.id === job.tech_id)
                                ?.name
                            : 'Unassigned'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status.charAt(0).toUpperCase() +
                              job.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <button
                            onClick={() => handleJobClick(job)}
                            className='text-blue-600 hover:text-blue-800'
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Right panel - Unassigned Jobs */}
            <div className='w-80 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col'>
              <div className='p-4 border-b border-gray-200'>
                <h3 className='font-medium'>Unassigned Jobs</h3>
                <p className='text-xs text-gray-500 mt-1'>
                  Drag jobs to schedule
                </p>
              </div>

              <div className='flex-1 overflow-y-auto p-3 space-y-3'>
                {unassignedJobs.map((job) => (
                  <div
                    key={job.id}
                    className='bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-grab'
                    onClick={() => handleJobClick(job)}
                  >
                    <div className='flex justify-between items-start'>
                      <div>
                        <h4 className='font-medium text-sm'>{job.customer}</h4>
                        <p className='text-xs text-gray-500 mt-1'>
                          {job.address}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : job.priority === 'Low'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {job.priority}
                      </span>
                    </div>

                    <div className='mt-2 pt-2 border-t border-gray-100'>
                      <div className='flex items-center text-xs text-gray-500'>
                        <FileText size={12} className='mr-1' />
                        {job.type}: {job.description}
                      </div>
                    </div>

                    <div className='mt-2 flex justify-between'>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status.charAt(0).toUpperCase() +
                          job.status.slice(1)}
                      </span>
                      <button className='text-blue-600 hover:text-blue-800 text-xs'>
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className='p-4 bg-gray-50 border-t border-gray-200'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>
                    Total: {unassignedJobs.length} unassigned jobs
                  </span>
                  <button className='text-blue-600 hover:text-blue-800 text-sm'>
                    View All
                  </button>
                </div>
                <div className='mt-3'>
                  <button className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm'>
                    Auto-Assign Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {showJobDetail && <JobDetailModal />}

      {/* Current Time Indicator - this would be animated in a real app */}
      {viewMode === 'day' && (
        <div
          className='absolute top-0 h-full border-l-2 border-red-500 z-10'
          style={{
            left: `${
              (((new Date().getHours() - 8) * 60 + new Date().getMinutes()) /
                15) *
                25 +
              96
            }px`,
            pointerEvents: 'none',
          }}
        >
          <div className='bg-red-500 text-white text-xs px-1 rounded'>
            {new Date().getHours()}:
            {String(new Date().getMinutes()).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
