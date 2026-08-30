import { useEffect, useState } from 'react';
import {
  FiEdit,
  FiTrash2,
  FiPhone,
  FiMail,
  FiCalendar,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiEye,
  FiStar,
  FiUser,
  FiBriefcase,
  FiHome,
  FiActivity,
  FiFile,
  FiLock,
  FiChevronRight,
  FiPlus,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import EditEmployeeModal from '../../components/Employee/EmployeeModals/EditEmployeeModal';
import { useParams } from 'react-router';
import { TEmployee } from '../../types/Employee';
import { GetEmployeeById } from '../../services/Employee';
import { EmployeeStatus } from '../../constants/Enumeration/EmployeeEnum/EmployeeEnum';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentEmployee, setCurrentEmployee] = useState<TEmployee>();

  // Sample data - would be replaced with real API calls
  const [employeeStats] = useState({
    jobsCompleted: 142,
    avgRating: 4.7,
    jobsThisWeek: 8,
    efficiency: 92,
    customerSatisfaction: 95,
  });

  const [assignedJobs] = useState([
    {
      id: 1,
      title: 'AC Installation',
      customer: 'Smith Residence',
      status: 'scheduled',
      date: '2023-06-15',
      time: '09:00 AM',
      total: '$1,250',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Furnace Repair',
      customer: 'Johnson Apartment',
      status: 'in-progress',
      date: '2023-06-16',
      time: '11:30 AM',
      total: '$450',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Maintenance Check',
      customer: 'Williams Office',
      status: 'completed',
      date: '2023-06-14',
      time: '02:00 PM',
      total: '$200',
      priority: 'low',
    },
  ]);

  const [documents] = useState([
    {
      id: 1,
      name: 'HVAC Certification.pdf',
      type: 'Certification',
      date: '2022-01-15',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'Safety Training Completion.pdf',
      type: 'Training',
      date: '2022-02-20',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Employment Contract.pdf',
      type: 'Contract',
      date: '2022-03-12',
      size: '3.2 MB',
    },
  ]);

  const [activities] = useState([
    {
      id: 1,
      action: 'Assigned to job #2456',
      date: '2023-06-14 09:30',
      by: 'System',
      type: 'assignment',
    },
    {
      id: 2,
      action: 'Completed job #2453',
      date: '2023-06-13 17:45',
      by: 'Alex Johnson',
      type: 'completion',
    },
    {
      id: 3,
      action: 'Updated profile information',
      date: '2023-06-10 14:20',
      by: 'Admin',
      type: 'update',
    },
  ]);

  const [permissions] = useState({
    canViewJobs: true,
    canCreateInvoice: true,
    canEditJobs: false,
    isAdmin: false,
  });

  const renderStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.Active:
        return (
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'>
            <FiCheckCircle className='mr-1.5' /> Active
          </span>
        );
      case EmployeeStatus.OnLeave:
        return (
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800'>
            <FiClock className='mr-1.5' /> On Leave
          </span>
        );
      case EmployeeStatus.Terminated:
        return (
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'>
            <FiXCircle className='mr-1.5' /> Terminated
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800'>
            Unknown
          </span>
        );
    }
  };

  const fetchCurrentEmployee = async () => {
    const response = await GetEmployeeById(employeeId as string);
    if (response.status === 200) {
      setCurrentEmployee(response.data.payload);
    }
  };

  useEffect(() => {
    fetchCurrentEmployee();
  }, [employeeId]);

  if (!currentEmployee)
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bg-primary'></div>
      </div>
    );

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 md:ml-64'>
        <Navbar />

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto p-6'>
          {/* Header Section */}
          <div className='flex flex-col md:flex-row md:items-start md:justify-between mb-8'>
            <div className='flex items-start space-x-6'>
              <div className='relative'>
                <div className='w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400 shadow-sm'>
                  {currentEmployee.imageUrl ? (
                    <img
                      src={currentEmployee.imageUrl}
                      alt={currentEmployee.user.firstName}
                      className='w-full h-full rounded-2xl object-cover'
                    />
                  ) : (
                    <FiUser className='w-10 h-10' />
                  )}
                </div>
                <div className='absolute -bottom-2 -right-2 bg-white rounded-full shadow-md'>
                  {renderStatusBadge(currentEmployee.status)}
                </div>
              </div>

              <div>
                <div className='flex items-center space-x-4'>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {currentEmployee.user.firstName}{' '}
                    {currentEmployee.user.lastName}
                  </h1>
                </div>

                <div className='mt-2 flex flex-wrap items-center gap-3'>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    <FiBriefcase className='mr-1.5' />{' '}
                    {currentEmployee.position || 'No position'}
                  </span>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                    <FiHome className='mr-1.5' />{' '}
                    {currentEmployee.department || 'No department'}
                  </span>
                </div>

                <div className='mt-4 flex flex-wrap gap-4'>
                  <a
                    href={`mailto:${currentEmployee.user.email}`}
                    className='flex items-center text-gray-600 hover:text-bg-primary transition-colors'
                  >
                    <FiMail className='mr-2' /> {currentEmployee.user.email}
                  </a>
                  <a
                    href={`tel:${currentEmployee.phoneNumber || '#'}`}
                    className='flex items-center text-gray-600 hover:text-bg-primary transition-colors'
                  >
                    <FiPhone className='mr-2' />{' '}
                    {currentEmployee.phoneNumber || 'No phone'}
                  </a>
                  <span className='flex items-center text-gray-600'>
                    <FiCalendar className='mr-2' /> Joined{' '}
                    {new Date(currentEmployee.hireDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-6 md:mt-0 flex flex-wrap gap-3'>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className='flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm'
              >
                <FiEdit className='mr-2' /> Edit Profile
              </button>
              <button className='flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm'>
                <FiFileText className='mr-2' /> Generate Report
              </button>
              <button className='flex items-center px-4 py-2 bg-bg-primary rounded-lg text-white hover:bg-bg-primary-hover transition-colors shadow-sm'>
                <FiPhone className='mr-2' /> Contact
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Jobs Completed
                </h3>
                <div className='p-2 rounded-lg bg-bg-primary/10 text-bg-primary'>
                  <FiBriefcase className='w-4 h-4' />
                </div>
              </div>
              <p className='mt-2 text-2xl font-semibold text-gray-900'>
                {employeeStats.jobsCompleted}
              </p>
              <p className='text-xs text-gray-500 mt-1'>+12% from last month</p>
            </div>

            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Avg. Rating
                </h3>
                <div className='p-2 rounded-lg bg-yellow-50 text-yellow-600'>
                  <FiStar className='w-4 h-4' />
                </div>
              </div>
              <div className='flex items-center mt-2'>
                <span className='text-2xl font-semibold text-gray-900 mr-2'>
                  {employeeStats.avgRating}
                </span>
                <div className='flex'>
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`${
                        i < Math.floor(employeeStats.avgRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      } w-4 h-4`}
                    />
                  ))}
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                98% positive feedback
              </p>
            </div>

            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-gray-500'>This Week</h3>
                <div className='p-2 rounded-lg bg-green-50 text-green-600'>
                  <FiActivity className='w-4 h-4' />
                </div>
              </div>
              <p className='mt-2 text-2xl font-semibold text-gray-900'>
                {employeeStats.jobsThisWeek}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                2 more than last week
              </p>
            </div>

            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Efficiency
                </h3>
                <div className='p-2 rounded-lg bg-purple-50 text-purple-600'>
                  <FiCheckCircle className='w-4 h-4' />
                </div>
              </div>
              <p className='mt-2 text-2xl font-semibold text-gray-900'>
                {employeeStats.efficiency}%
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Above company average
              </p>
            </div>

            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Satisfaction
                </h3>
                <div className='p-2 rounded-lg bg-pink-50 text-pink-600'>
                  <FiStar className='w-4 h-4' />
                </div>
              </div>
              <p className='mt-2 text-2xl font-semibold text-gray-900'>
                {employeeStats.customerSatisfaction}%
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                5-star rating average
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className='mb-6'>
            <nav className='flex space-x-8 border-b border-gray-200'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'overview'
                    ? 'border-bg-primary text-bg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUser className='mr-2' /> Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'jobs'
                    ? 'border-bg-primary text-bg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiBriefcase className='mr-2' /> Jobs
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'documents'
                    ? 'border-bg-primary text-bg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiFile className='mr-2' /> Documents
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'activity'
                    ? 'border-bg-primary text-bg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiActivity className='mr-2' /> Activity
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'permissions'
                    ? 'border-bg-primary text-bg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiLock className='mr-2' /> Permissions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className='p-6'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  <div className='lg:col-span-2'>
                    <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                      Recent Activity
                    </h2>
                    <div className='space-y-4'>
                      {activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className='flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0'
                        >
                          <div
                            className={`flex-shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full ${
                              activity.type === 'assignment'
                                ? 'bg-bg-primary/10 text-bg-primary'
                                : activity.type === 'completion'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-purple-50 text-purple-600'
                            }`}
                          >
                            {activity.type === 'assignment' ? (
                              <FiBriefcase className='w-4 h-4' />
                            ) : activity.type === 'completion' ? (
                              <FiCheckCircle className='w-4 h-4' />
                            ) : (
                              <FiEdit className='w-4 h-4' />
                            )}
                          </div>
                          <div className='ml-3 flex-1'>
                            <p className='text-sm font-medium text-gray-900'>
                              {activity.action}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {new Date(activity.date).toLocaleString()} • by{' '}
                              {activity.by}
                            </p>
                          </div>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <FiChevronRight className='w-5 h-5' />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className='mt-8'>
                      <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                        Upcoming Jobs
                      </h2>
                      <div className='space-y-3'>
                        {assignedJobs
                          .filter((job) => job.status !== 'completed')
                          .slice(0, 3)
                          .map((job) => (
                            <div
                              key={job.id}
                              className='p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                              <div className='flex justify-between items-start'>
                                <div>
                                  <h3 className='font-medium text-gray-900'>
                                    {job.title}
                                  </h3>
                                  <p className='text-sm text-gray-600 mt-1'>
                                    {job.customer}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    job.priority === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : job.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {job.priority} priority
                                </span>
                              </div>
                              <div className='mt-3 flex items-center justify-between'>
                                <span className='text-sm text-gray-500'>
                                  {job.date} at {job.time}
                                </span>
                                <span className='text-sm font-medium text-gray-900'>
                                  {job.total}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                      Quick Stats
                    </h2>
                    <div className='space-y-4'>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='text-sm font-medium text-gray-500'>
                          Current Workload
                        </h3>
                        <div className='mt-2 flex items-center'>
                          <div className='w-full bg-gray-200 rounded-full h-2.5'>
                            <div
                              className='bg-bg-primary h-2.5 rounded-full'
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                          <span className='ml-2 text-sm font-medium text-gray-700'>
                            75%
                          </span>
                        </div>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='text-sm font-medium text-gray-500'>
                          Performance Trend
                        </h3>
                        <div className='mt-2 h-20'>
                          {/* This would be replaced with an actual chart component */}
                          <div className='flex items-end h-full space-x-1'>
                            {[3, 5, 7, 6, 8, 9, 7].map((value, index) => (
                              <div
                                key={index}
                                className='w-4 bg-blue-100 rounded-t hover:bg-blue-200 transition-colors'
                                style={{ height: `${value * 10}%` }}
                                title={`Week ${index + 1}: ${value}/10`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='text-sm font-medium text-gray-500'>
                          Certifications
                        </h3>
                        <div className='mt-2 space-y-2'>
                          {documents
                            .filter((doc) => doc.type === 'Certification')
                            .map((doc) => (
                              <div
                                key={doc.id}
                                className='flex items-center justify-between p-2 hover:bg-white rounded transition-colors'
                              >
                                <div className='flex items-center'>
                                  <FiFileText className='text-blue-500 mr-2' />
                                  <span className='text-sm font-medium text-gray-700 truncate max-w-[180px]'>
                                    {doc.name}
                                  </span>
                                </div>
                                <span className='text-xs text-gray-500'>
                                  {doc.date}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className='p-6 bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                  <h2 className='text-xl font-semibold text-gray-800'>
                    Assigned Jobs
                  </h2>
                  <div className='flex gap-3 w-full sm:w-auto'>
                    <select className='px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-bg-primary focus:border-bg-primary'>
                      <option>All Status</option>
                      <option>Scheduled</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                    <button className='flex items-center justify-center gap-2 px-4 py-2 bg-bg-primary hover:bg-bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors'>
                      <FiPlus size={16} />
                      <span>Assign Job</span>
                    </button>
                  </div>
                </div>

                <div className='overflow-x-auto rounded-lg border border-gray-200'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Job Details
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Customer
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Priority
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Status
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Schedule
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Total
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {assignedJobs.map((job) => (
                        <tr
                          key={job.id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4'>
                            <div className='font-medium text-gray-900'>
                              {job.title}
                            </div>
                          </td>
                          <td className='px-6 py-4 text-sm text-gray-600'>
                            {job.customer}
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                job.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : job.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {job.priority}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                job.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : job.status === 'in-progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {job.status
                                .split('-')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ')}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-sm text-gray-600'>
                            <div className='font-medium'>
                              {formatDate(job.date)}
                            </div>
                            <div className='text-gray-500'>{job.time}</div>
                          </td>
                          <td className='px-6 py-4 text-right font-medium text-gray-900'>
                            {job.total}
                          </td>
                          <td className='px-6 py-4 text-right space-x-2'>
                            View job
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className='flex flex-col sm:flex-row justify-between items-center mt-6 px-2 gap-4'>
                  <div className='text-sm text-gray-500'>
                    Showing <span className='font-medium'>1</span> to{' '}
                    <span className='font-medium'>{assignedJobs.length}</span>{' '}
                    of{' '}
                    <span className='font-medium'>{assignedJobs.length}</span>{' '}
                    jobs
                  </div>
                  <div className='flex gap-2'>
                    <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
                      Previous
                    </button>
                    <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className='p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Documents & Certifications
                  </h2>
                  <button className='flex items-center px-3 py-2 bg-bg-primary hover:bg-bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors'>
                    <FiPlus className='mr-1.5' /> Upload Document
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center'>
                          <div className='p-2 bg-blue-50 rounded-lg text-bg-primary mr-3'>
                            <FiFileText className='w-5 h-5' />
                          </div>
                          <div>
                            <h3 className='font-medium text-gray-900 truncate max-w-[180px]'>
                              {doc.name}
                            </h3>
                            <p className='text-sm text-gray-500'>{doc.type}</p>
                          </div>
                        </div>
                        <div className='dropdown relative'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <svg
                              className='w-5 h-5'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className='mt-4 flex items-center justify-between'>
                        <span className='text-xs text-gray-500'>
                          {doc.size} • {new Date(doc.date).toLocaleDateString()}
                        </span>
                        <div className='flex space-x-2'>
                          <button className='p-1.5 text-gray-500 hover:text-bg-primary hover:bg-bg-primary/10 rounded transition-colors'>
                            <FiEye className='w-4 h-4' />
                          </button>
                          <button className='p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors'>
                            <FiDownload className='w-4 h-4' />
                          </button>
                          <button className='p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors'>
                            <FiTrash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className='p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                  Activity History
                </h2>

                <div className='space-y-6'>
                  {activities.map((activity) => (
                    <div key={activity.id} className='flex'>
                      <div className='flex flex-col items-center mr-4'>
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            activity.type === 'assignment'
                              ? 'bg-bg-primary/10 text-bg-primary'
                              : activity.type === 'completion'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {activity.type === 'assignment' ? (
                            <FiBriefcase className='w-5 h-5' />
                          ) : activity.type === 'completion' ? (
                            <FiCheckCircle className='w-5 h-5' />
                          ) : (
                            <FiEdit className='w-5 h-5' />
                          )}
                        </div>
                        <div className='w-px h-full bg-gray-200 my-2'></div>
                      </div>
                      <div className='pt-1 pb-6 flex-1'>
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <p className='font-medium text-gray-900'>
                            {activity.action}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>
                            {new Date(activity.date).toLocaleString()} • by{' '}
                            {activity.by}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className='p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                  Permissions & Access
                </h2>

                <div className='space-y-6'>
                  <div>
                    <h3 className='text-md font-medium text-gray-900 mb-4'>
                      Role
                    </h3>
                    <div className='flex items-center'>
                      <div className='p-3 bg-gray-50 rounded-lg mr-4'>
                        <FiLock className='w-6 h-6 text-gray-500' />
                      </div>
                      <div>
                        <p className='font-medium'>
                          {permissions.isAdmin
                            ? 'Administrator'
                            : 'Field Technician'}
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                          {permissions.isAdmin
                            ? 'Full access to all system features'
                            : 'Standard field technician access'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-md font-medium text-gray-900 mb-4'>
                      Access Permissions
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <p className='font-medium'>View Jobs</p>
                          <p className='text-sm text-gray-500 mt-1'>
                            Can view assigned jobs
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            className='sr-only peer'
                            checked={permissions.canViewJobs}
                            readOnly
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bg-primary"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <p className='font-medium'>Create Invoice</p>
                          <p className='text-sm text-gray-500 mt-1'>
                            Can create invoices for jobs
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            className='sr-only peer'
                            checked={permissions.canCreateInvoice}
                            readOnly
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bg-primary"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <p className='font-medium'>Edit Jobs</p>
                          <p className='text-sm text-gray-500 mt-1'>
                            Can modify job details
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            className='sr-only peer'
                            checked={permissions.canEditJobs}
                            readOnly
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className='pt-4'>
                    <button className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'>
                      Request Additional Permissions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isEditModalOpen && (
        <EditEmployeeModal
          employee={currentEmployee}
          onClose={() => setIsEditModalOpen(false)}
          fetchCurrentEmployee={fetchCurrentEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeDetails;
