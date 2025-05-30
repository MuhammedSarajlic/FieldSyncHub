import { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  MapPin,
  FileText,
  Tag,
} from 'lucide-react';

// Mock data for service requests
const requestsData = [
  {
    id: 'REQ-001',
    clientName: 'Robertson Construction',
    serviceType: 'Electrical Repair',
    description: 'Circuit breaker malfunction in office building basement',
    address: '1442 Main Street, Suite 100, Portland, OR 97204',
    dateSubmitted: '2025-05-02T10:30:00',
    scheduledDate: '2025-05-07T09:00:00',
    priority: 'High',
    status: 'Pending',
    attachments: 2,
  },
  {
    id: 'REQ-002',
    clientName: 'Greenway Apartments',
    serviceType: 'Plumbing',
    description: 'Water leak in unit 304, affecting ceiling of unit 204',
    address: '873 Park Avenue, Building B, Seattle, WA 98101',
    dateSubmitted: '2025-05-03T15:45:00',
    scheduledDate: '2025-05-05T13:00:00',
    priority: 'Urgent',
    status: 'Scheduled',
    attachments: 1,
  },
  {
    id: 'REQ-003',
    clientName: 'Sunshine Daycare',
    serviceType: 'HVAC Maintenance',
    description: 'Regular quarterly maintenance check for all HVAC units',
    address: '2290 Child Lane, Vancouver, WA 98660',
    dateSubmitted: '2025-05-01T09:15:00',
    scheduledDate: '2025-05-12T10:00:00',
    priority: 'Normal',
    status: 'Approved',
    attachments: 0,
  },
  {
    id: 'REQ-004',
    clientName: 'Riverfront Hotel',
    serviceType: 'Landscaping',
    description: 'Garden renovation for main entrance area',
    address: '55 River Road, Seaside, OR 97138',
    dateSubmitted: '2025-04-28T11:20:00',
    scheduledDate: '2025-05-10T08:00:00',
    priority: 'Normal',
    status: 'Approved',
    attachments: 3,
  },
  {
    id: 'REQ-005',
    clientName: 'Oakridge Medical Center',
    serviceType: 'Security System',
    description: 'Installation of new security cameras on floors 2-4',
    address: '1200 Healthcare Drive, Beaverton, OR 97005',
    dateSubmitted: '2025-05-04T08:00:00',
    scheduledDate: null,
    priority: 'High',
    status: 'New',
    attachments: 1,
  },
];

const Requests = () => {
  const [requests, setRequests] = useState(requestsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dateSubmitted');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort function
  const filteredRequests = requests
    .filter((request) => {
      // Search filter
      const matchesSearch =
        request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'All' || request.status === statusFilter;

      // Priority filter
      const matchesPriority =
        priorityFilter === 'All' || request.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // Sort logic
      if (a[sortBy] === null) return 1;
      if (b[sortBy] === null) return -1;

      if (sortBy === 'dateSubmitted' || sortBy === 'scheduledDate') {
        return sortOrder === 'asc'
          ? new Date(a[sortBy]) - new Date(b[sortBy])
          : new Date(b[sortBy]) - new Date(a[sortBy]);
      }

      // For text fields
      return sortOrder === 'asc'
        ? a[sortBy].localeCompare(b[sortBy])
        : b[sortBy].localeCompare(a[sortBy]);
    });

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getBadgeClasses = () => {
      switch (status) {
        case 'New':
          return 'bg-blue-100 text-blue-800';
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'Approved':
          return 'bg-green-100 text-green-800';
        case 'Scheduled':
          return 'bg-purple-100 text-purple-800';
        case 'Completed':
          return 'bg-gray-100 text-gray-800';
        case 'Cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getBadgeIcon = () => {
      switch (status) {
        case 'New':
          return <FileText className='w-4 h-4 mr-1' />;
        case 'Pending':
          return <Clock className='w-4 h-4 mr-1' />;
        case 'Approved':
          return <CheckCircle className='w-4 h-4 mr-1' />;
        case 'Scheduled':
          return <Calendar className='w-4 h-4 mr-1' />;
        case 'Completed':
          return <CheckCircle className='w-4 h-4 mr-1' />;
        case 'Cancelled':
          return <XCircle className='w-4 h-4 mr-1' />;
        default:
          return null;
      }
    };

    return (
      <span
        className={`flex items-center px-2 py-1 text-xs rounded-full ${getBadgeClasses()}`}
      >
        {getBadgeIcon()}
        {status}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const getBadgeClasses = () => {
      switch (priority) {
        case 'Urgent':
          return 'bg-red-100 text-red-800';
        case 'High':
          return 'bg-orange-100 text-orange-800';
        case 'Normal':
          return 'bg-blue-100 text-blue-800';
        case 'Low':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getBadgeIcon = () => {
      switch (priority) {
        case 'Urgent':
          return <AlertTriangle className='w-4 h-4 mr-1' />;
        case 'High':
          return <AlertTriangle className='w-4 h-4 mr-1' />;
        default:
          return <Tag className='w-4 h-4 mr-1' />;
      }
    };

    return (
      <span
        className={`flex items-center px-2 py-1 text-xs rounded-full ${getBadgeClasses()}`}
      >
        {getBadgeIcon()}
        {priority}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-[260px] flex flex-col'>
        <div>
          <Navbar />
        </div>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold text-gray-800'>
              Service Requests
            </h1>
            <button className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center'>
              <span>Export</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className='bg-white p-4 rounded-lg shadow-sm mb-6'>
            <div className='flex flex-wrap gap-4'>
              {/* Search bar */}
              <div className='relative flex-grow max-w-md'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Search className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  placeholder='Search requests...'
                  className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status filter */}
              <div className='relative'>
                <div className='flex items-center border border-gray-300 rounded-md'>
                  <span className='pl-3 text-gray-500 text-sm'>Status:</span>
                  <select
                    className='py-2 pl-2 pr-8 bg-transparent border-none focus:ring-0'
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value='All'>All</option>
                    <option value='New'>New</option>
                    <option value='Pending'>Pending</option>
                    <option value='Approved'>Approved</option>
                    <option value='Scheduled'>Scheduled</option>
                    <option value='Completed'>Completed</option>
                    <option value='Cancelled'>Cancelled</option>
                  </select>
                  <ChevronDown className='h-4 w-4 mr-2 text-gray-500' />
                </div>
              </div>

              {/* Priority filter */}
              <div className='relative'>
                <div className='flex items-center border border-gray-300 rounded-md'>
                  <span className='pl-3 text-gray-500 text-sm'>Priority:</span>
                  <select
                    className='py-2 pl-2 pr-8 bg-transparent border-none focus:ring-0'
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value='All'>All</option>
                    <option value='Urgent'>Urgent</option>
                    <option value='High'>High</option>
                    <option value='Normal'>Normal</option>
                    <option value='Low'>Low</option>
                  </select>
                  <ChevronDown className='h-4 w-4 mr-2 text-gray-500' />
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            {filteredRequests.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('id')}
                      >
                        <div className='flex items-center'>
                          <span>Request ID</span>
                          {sortBy === 'id' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('clientName')}
                      >
                        <div className='flex items-center'>
                          <span>Client</span>
                          {sortBy === 'clientName' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('serviceType')}
                      >
                        <div className='flex items-center'>
                          <span>Service Type</span>
                          {sortBy === 'serviceType' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('dateSubmitted')}
                      >
                        <div className='flex items-center'>
                          <span>Date Submitted</span>
                          {sortBy === 'dateSubmitted' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('scheduledDate')}
                      >
                        <div className='flex items-center'>
                          <span>Scheduled For</span>
                          {sortBy === 'scheduledDate' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('priority')}
                      >
                        <div className='flex items-center'>
                          <span>Priority</span>
                          {sortBy === 'priority' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                        onClick={() => handleSort('status')}
                      >
                        <div className='flex items-center'>
                          <span>Status</span>
                          {sortBy === 'status' && (
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transform ${
                                sortOrder === 'asc' ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className='hover:bg-gray-50 cursor-pointer transition-colors duration-150'
                      >
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600'>
                          {request.id}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          <div className='flex items-center'>
                            <User className='h-4 w-4 mr-2 text-gray-500' />
                            {request.clientName}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {request.serviceType}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatDate(request.dateSubmitted)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatDate(request.scheduledDate)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <PriorityBadge priority={request.priority} />
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <StatusBadge status={request.status} />
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <div className='flex space-x-2'>
                            <button className='text-blue-600 hover:text-blue-800'>
                              View
                            </button>
                            <button className='text-gray-600 hover:text-gray-800'>
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='text-center py-10'>
                <p className='text-gray-500'>
                  No requests found matching your filters.
                </p>
              </div>
            )}
          </div>

          {/* Request Details (Expandable) */}
          <div className='mt-6 bg-white p-6 rounded-lg shadow-sm hidden'>
            <h2 className='text-xl font-bold mb-4'>
              Request Details - REQ-001
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Client Information
                  </h3>
                  <p className='mt-1 text-sm text-gray-900'>
                    Robertson Construction
                  </p>
                  <p className='text-sm text-gray-600'>client123@example.com</p>
                  <p className='text-sm text-gray-600'>(503) 555-1234</p>
                </div>
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Service Location
                  </h3>
                  <div className='flex items-start mt-1'>
                    <MapPin className='h-5 w-5 text-gray-400 mr-2 mt-0.5' />
                    <p className='text-sm text-gray-900'>
                      1442 Main Street, Suite 100
                      <br />
                      Portland, OR 97204
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Request Details
                  </h3>
                  <p className='mt-1 text-sm text-gray-900'>
                    <span className='font-medium'>Service Type:</span>{' '}
                    Electrical Repair
                  </p>
                  <p className='text-sm text-gray-900'>
                    <span className='font-medium'>Description:</span> Circuit
                    breaker malfunction in office building basement.
                  </p>
                </div>
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Schedule
                  </h3>
                  <p className='mt-1 text-sm text-gray-900'>
                    <span className='font-medium'>Requested Date:</span> May 7,
                    2025
                  </p>
                  <p className='text-sm text-gray-900'>
                    <span className='font-medium'>Requested Time:</span> 9:00 AM
                    - 12:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;
