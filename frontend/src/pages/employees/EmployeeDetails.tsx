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
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import EditEmployeeModal from '../../components/Employee/EmployeeModals/EditEmployeeModal';
import { useParams } from 'react-router';
import { TEmployee } from '../../types/Employee';
import { GetEmployeeById } from '../../services/Employee';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [currentEmployee, setCurrentEmployee] = useState<TEmployee>();
  const [employee] = useState({
    name: 'Alex Johnson',
    position: 'HVAC Technician',
    department: 'Field Operations',
    status: 'active',
    hireDate: '2022-03-12',
    email: 'alex.johnson@company.com',
    phone: '(555) 123-4567',
    profilePhoto: null,
    jobsCompleted: 142,
    avgRating: 4.7,
    jobsThisWeek: 8,
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
    },
    {
      id: 2,
      title: 'Furnace Repair',
      customer: 'Johnson Apartment',
      status: 'in-progress',
      date: '2023-06-16',
      time: '11:30 AM',
      total: '$450',
    },
    {
      id: 3,
      title: 'Maintenance Check',
      customer: 'Williams Office',
      status: 'completed',
      date: '2023-06-14',
      time: '02:00 PM',
      total: '$200',
    },
  ]);

  const [documents] = useState([
    {
      id: 1,
      name: 'HVAC Certification.pdf',
      type: 'Certification',
      date: '2022-01-15',
    },
    {
      id: 2,
      name: 'Safety Training Completion.pdf',
      type: 'Training',
      date: '2022-02-20',
    },
    {
      id: 3,
      name: 'Employment Contract.pdf',
      type: 'Contract',
      date: '2022-03-12',
    },
  ]);

  const [activities] = useState([
    {
      id: 1,
      action: 'Assigned to job #2456',
      date: '2023-06-14 09:30',
      by: 'System',
    },
    {
      id: 2,
      action: 'Completed job #2453',
      date: '2023-06-13 17:45',
      by: 'Alex Johnson',
    },
    {
      id: 3,
      action: 'Updated profile information',
      date: '2023-06-10 14:20',
      by: 'Admin',
    },
  ]);

  const [permissions] = useState({
    canViewJobs: true,
    canCreateInvoice: true,
    canEditJobs: false,
    isAdmin: false,
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className='bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center'>
            <FiCheckCircle className='mr-1' /> Active
          </span>
        );
      case 'on-leave':
        return (
          <span className='bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center'>
            <FiClock className='mr-1' /> On Leave
          </span>
        );
      case 'terminated':
        return (
          <span className='bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center'>
            <FiXCircle className='mr-1' /> Terminated
          </span>
        );
      default:
        return (
          <span className='bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
            Unknown
          </span>
        );
    }
  };

  const fetchCurrentEmployee = async () => {
    const response = await GetEmployeeById(employeeId as string);
    if (response.status === 200) {
      console.log(response);
      setCurrentEmployee(response.data.payload);
    }
  };

  useEffect(() => {
    fetchCurrentEmployee();
  }, [employeeId]);

  if (!currentEmployee) return <p>Loading...</p>;

  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden ml-[260px]'>
        <Navbar />

        <div className='flex-1 overflow-y-auto px-4 pb-4'>
          {/* Header Section */}
          <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between'>
              <div className='flex items-start space-x-4'>
                <div className='w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400'>
                  {employee.profilePhoto ? (
                    <img
                      src={employee.profilePhoto}
                      alt={employee.name}
                      className='w-full h-full rounded-full object-cover'
                    />
                  ) : (
                    <span className='text-2xl font-medium'>
                      {currentEmployee.user.firstName.charAt(0)}
                      {currentEmployee.user.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className='flex items-center space-x-3'>
                    <h1 className='text-2xl font-bold text-gray-800'>
                      {currentEmployee.user.firstName}{' '}
                      {currentEmployee.user.lastName}
                    </h1>
                    {renderStatusBadge(currentEmployee.status)}
                  </div>
                  <p className='text-gray-600 mt-1'>
                    {currentEmployee.position ?? 'no position'} •{' '}
                    {currentEmployee.department ?? 'no department'}
                  </p>
                  <p className='text-gray-500 text-sm mt-1 flex items-center'>
                    <FiCalendar className='mr-1.5' /> Hired on{' '}
                    {new Date(currentEmployee.hireDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
                  </p>

                  <div className='flex flex-wrap gap-3 mt-3'>
                    <a
                      href={`mailto:${currentEmployee.user.email}`}
                      className='text-gray-600 hover:text-blue-600 text-sm flex items-center'
                    >
                      <FiMail className='mr-1.5' /> {currentEmployee.user.email}
                    </a>
                    {employee.phone && (
                      <a
                        href={`tel:${employee.phone}`}
                        className='text-gray-600 hover:text-blue-600 text-sm flex items-center'
                      >
                        <FiPhone className='mr-1.5' /> {employee.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className='mt-4 md:mt-0 flex flex-wrap gap-2'>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className='flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors'
                >
                  <FiEdit className='mr-2' /> Edit Info
                </button>
                <button className='flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors'>
                  <FiTrash2 className='mr-2' /> Deactivate
                </button>
                <button className='flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors'>
                  <FiPhone className='mr-2' /> Contact
                </button>
                <button className='flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors'>
                  <FiFileText className='mr-2' /> View Assigned Jobs
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Total Jobs Completed
                </h3>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  {employee.jobsCompleted}
                </p>
              </div>
              <div className='bg-green-50 p-4 rounded-lg'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Jobs This Week
                </h3>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  {employee.jobsThisWeek}
                </p>
              </div>
              <div className='bg-yellow-50 p-4 rounded-lg'>
                <h3 className='text-sm font-medium text-gray-500'>
                  Average Rating
                </h3>
                <div className='flex items-center mt-1'>
                  <span className='text-2xl font-bold text-gray-800 mr-2'>
                    {employee.avgRating}
                  </span>
                  <div className='flex'>
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${
                          i < Math.floor(employee.avgRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        } w-5 h-5`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className='border-b border-gray-200 mb-6'>
            <nav className='-mb-px flex space-x-8 overflow-x-auto'>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assigned Jobs
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity History
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permissions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            {/* Assigned Jobs */}
            {activeTab === 'jobs' && (
              <div>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-medium text-gray-800'>
                    Assigned Jobs
                  </h2>
                  <button className='text-sm text-blue-600 hover:text-blue-800 font-medium'>
                    View All
                  </button>
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Job Title
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
                          Status
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Date & Time
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Total
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {assignedJobs.map((job) => (
                        <tr key={job.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {job.title}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {job.customer}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {job.status === 'scheduled' && (
                              <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                                Scheduled
                              </span>
                            )}
                            {job.status === 'in-progress' && (
                              <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                                In Progress
                              </span>
                            )}
                            {job.status === 'completed' && (
                              <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                                Completed
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {job.date} at {job.time}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {job.total}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                            <button className='text-blue-600 hover:text-blue-900'>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Schedule */}
            {activeTab === 'schedule' && (
              <div>
                <h2 className='text-lg font-medium text-gray-800 mb-4'>
                  Schedule
                </h2>
                <div className='bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center'>
                  <div className='text-center'>
                    <FiCalendar className='mx-auto h-12 w-12 text-gray-400' />
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                      Calendar View
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      Weekly schedule visualization would appear here.
                    </p>
                  </div>
                </div>

                <div className='mt-6'>
                  <h3 className='text-md font-medium text-gray-800 mb-3'>
                    Upcoming Assignments
                  </h3>
                  <div className='space-y-4'>
                    {assignedJobs.map((job) => (
                      <div
                        key={job.id}
                        className='border-l-4 border-blue-500 pl-4 py-2'
                      >
                        <div className='flex justify-between'>
                          <h4 className='font-medium text-gray-800'>
                            {job.title}
                          </h4>
                          <span className='text-sm text-gray-500'>
                            {job.date} at {job.time}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>{job.customer}</p>
                        <div className='mt-1 flex items-center'>
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              job.status === 'scheduled'
                                ? 'bg-blue-500'
                                : job.status === 'in-progress'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          ></span>
                          <span className='text-xs text-gray-500 capitalize'>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity History */}
            {activeTab === 'activity' && (
              <div>
                <h2 className='text-lg font-medium text-gray-800 mb-4'>
                  Activity History
                </h2>
                <div className='space-y-4'>
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className='flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0'
                    >
                      <div className='flex-shrink-0 mt-1'>
                        <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                      </div>
                      <div className='ml-3 flex-1'>
                        <p className='text-sm text-gray-800'>
                          {activity.action}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {new Date(activity.date).toLocaleString()} • by{' '}
                          {activity.by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-medium text-gray-800'>
                    Documents & Certifications
                  </h2>
                  <button className='flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors'>
                    <FiDownload className='mr-1.5' /> Upload Document
                  </button>
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          File Name
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Type
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Upload Date
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {doc.name}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {doc.type}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {new Date(doc.date).toLocaleDateString()}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3'>
                            <button className='text-blue-600 hover:text-blue-900 flex items-center'>
                              <FiEye className='mr-1' /> View
                            </button>
                            <button className='text-gray-600 hover:text-gray-900 flex items-center'>
                              <FiDownload className='mr-1' /> Download
                            </button>
                            <button className='text-red-600 hover:text-red-900 flex items-center'>
                              <FiTrash2 className='mr-1' /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Permissions */}
            {activeTab === 'permissions' && (
              <div>
                <h2 className='text-lg font-medium text-gray-800 mb-6'>
                  Permissions & Access
                </h2>

                <div className='space-y-6'>
                  <div>
                    <h3 className='text-md font-medium text-gray-800 mb-3'>
                      Role
                    </h3>
                    <div className='bg-gray-50 p-4 rounded-lg inline-block'>
                      <span className='font-medium'>
                        {permissions.isAdmin
                          ? 'Administrator'
                          : 'Field Technician'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-md font-medium text-gray-800 mb-3'>
                      Access Permissions
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <div>
                          <p className='font-medium'>View Jobs</p>
                          <p className='text-sm text-gray-500'>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <div>
                          <p className='font-medium'>Create Invoice</p>
                          <p className='text-sm text-gray-500'>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <div>
                          <p className='font-medium'>Edit Jobs</p>
                          <p className='text-sm text-gray-500'>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
