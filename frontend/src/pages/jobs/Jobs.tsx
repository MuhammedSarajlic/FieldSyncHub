import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import JobsTable from '../../components/Jobs/JobsTable/JobsTable';
import CustomButton from '../../components/CustomElements/CustomButton';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';

const Jobs = () => {
  // Sample data - replace with your actual data source
  const [jobs, setJobs] = useState([
    {
      id: 1,
      customer: 'John Smith',
      address: '123 Oak Street, Anytown',
      service: 'Plumbing Repair',
      status: 'Scheduled',
      date: 'May 10, 2025',
      time: '09:00 AM',
      priority: 'High',
      payment: 'Pending',
      value: '$150.00',
    },
    {
      id: 2,
      customer: 'Alice Johnson',
      address: '456 Maple Ave, Somecity',
      service: 'Electrical Inspection',
      status: 'In Progress',
      date: 'May 04, 2025',
      time: '10:30 AM',
      priority: 'Medium',
      payment: 'Partial',
      value: '$220.00',
    },
    {
      id: 3,
      customer: 'Robert Davis',
      address: '789 Pine Road, Elsewhere',
      service: 'HVAC Maintenance',
      status: 'Completed',
      date: 'May 03, 2025',
      time: '02:00 PM',
      priority: 'Low',
      payment: 'Paid',
      value: '$350.00',
    },
    {
      id: 4,
      customer: 'Emily Wilson',
      address: '321 Cedar Lane, Newtown',
      service: 'Pool Cleaning',
      status: 'Scheduled',
      date: 'May 12, 2025',
      time: '11:00 AM',
      priority: 'Medium',
      payment: 'Pending',
      value: '$95.00',
    },
    {
      id: 5,
      customer: 'Michael Brown',
      address: '654 Birch Blvd, Oldcity',
      service: 'Lawn Mowing',
      status: 'Canceled',
      date: 'May 05, 2025',
      time: '01:00 PM',
      priority: 'Low',
      payment: 'Refunded',
      value: '$80.00',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Metrics calculation
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((job) => job.status === 'Completed').length;
  const scheduledJobs = jobs.filter((job) => job.status === 'Scheduled').length;
  const inProgressJobs = jobs.filter(
    (job) => job.status === 'In Progress'
  ).length;
  const totalValue = jobs.reduce((sum, job) => {
    const value = parseFloat(job.value.replace('$', ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Filter jobs based on status and search term
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    const matchesSearch =
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar />
        </div>

        {/* Main content */}
        <div className='px-4'>
          {/* Page header */}
          <div className='pb-4 mb-4 flex items-center justify-between'>
            <p className='text-heading text-4xl font-extrabold'>Jobs</p>
            <div className='flex items-center space-x-3'>
              <CustomButton
                title='Create job'
                // handleBtnClick={() => setIsAddCustomerModalOpen(true)}
              />
            </div>
          </div>

          {/* Overview cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-blue-100 text-blue-600 mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>
                    Total Jobs
                  </p>
                  <p className='text-xl font-bold'>{totalJobs}</p>
                </div>
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-green-100 text-green-600 mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>Completed</p>
                  <p className='text-xl font-bold'>{completedJobs}</p>
                </div>
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>Scheduled</p>
                  <p className='text-xl font-bold'>{scheduledJobs}</p>
                </div>
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-purple-100 text-purple-600 mr-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>
                    Total Value
                  </p>
                  <p className='text-xl font-bold'>${totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and search */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4'>
            <div className='flex flex-wrap items-center space-x-2'>
              <span className='text-sm font-medium text-gray-700'>
                Filter by:
              </span>
              <div className='inline-flex rounded-md shadow-sm' role='group'>
                <button
                  type='button'
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    filterStatus === 'All'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setFilterStatus('All')}
                >
                  All
                </button>
                <button
                  type='button'
                  className={`px-4 py-2 text-sm font-medium ${
                    filterStatus === 'Scheduled'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setFilterStatus('Scheduled')}
                >
                  Scheduled
                </button>
                <button
                  type='button'
                  className={`px-4 py-2 text-sm font-medium ${
                    filterStatus === 'In Progress'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setFilterStatus('In Progress')}
                >
                  In Progress
                </button>
                <button
                  type='button'
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    filterStatus === 'Completed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setFilterStatus('Completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            <div className='relative w-full md:w-64'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-500'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 20 20'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                  />
                </svg>
              </div>
              <input
                type='search'
                className='block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500'
                placeholder='Search jobs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6'>
            <JobsTable filteredJobs={filteredJobs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
