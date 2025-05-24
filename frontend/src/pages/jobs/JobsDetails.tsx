import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import CustomButton from '../../components/CustomElements/CustomButton';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';

// Import type definitions from the model
import {
  Job,
  JobStatus,
  StatusChange,
  ServiceItem,
  LineItem,
} from '../../models/JobModel';
import { useNavigate, useParams } from 'react-router';
import { TJob } from '../../types/Job';
import { GetJobById } from '../../services/Job';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [jobDetails, setJobDetails] = useState<TJob>();

  const fetchJobById = async () => {
    const response = await GetJobById(jobId as string);
    if (response.status === 200) {
      console.log(response);
      setJobDetails(response.data.payload);
    }
  };

  useEffect(() => {
    fetchJobById();
  }, [jobId]);

  // Sample job data - in a real app, you would fetch this from your API
  const [job, setJob] = useState<Job>({
    // Primary Information
    id: '1',
    title: 'Kitchen Sink Repair and Bathroom Leak Inspection',
    description:
      'Customer reported leaking pipes under the kitchen sink. Also needs inspection of bathroom faucet that shows signs of leaking. Requires immediate attention to prevent water damage to cabinets.',
    internal_notes:
      'Customer has had similar issues in the past. May need to replace kitchen sink P-trap completely rather than just fixing the connection.',

    // Customer & Location Information
    customer_id: '101',
    property_id: '201',
    address_override: null,

    // Service Information
    service_id: '301',
    service_items: [
      {
        service_id: '1001',
        name: 'Plumbing Service Call',
        quantity: 1,
        unit_price: 85.0,
        total_price: 85.0,
        notes: null,
      },
      {
        service_id: '1002',
        name: 'Sink P-trap Replacement',
        quantity: 1,
        unit_price: 45.0,
        total_price: 45.0,
        notes: 'Standard PVC parts',
      },
      {
        service_id: '1003',
        name: 'Bathroom Leak Inspection',
        quantity: 1,
        unit_price: 35.0,
        total_price: 35.0,
        notes: null,
      },
    ],
    custom_line_items: [
      {
        description: 'Priority Service Fee',
        amount: 25.0,
        type: 'charge',
      },
      {
        description: 'Loyal Customer Discount',
        amount: -10.0,
        type: 'discount',
      },
    ],

    // Status & Priority
    status: 'Scheduled',
    status_history: [
      {
        from: 'New',
        to: 'Scheduled',
        changed_at: '2025-05-02T09:15:00',
        changed_by: 'Admin User',
        notes: 'Customer confirmed availability via phone',
      },
    ],
    priority: 'High',

    // Scheduling
    schedule_date: '2025-05-10',
    schedule_time: '09:00',
    duration_minutes: 120,
    window_start_time: '08:30',
    window_end_time: '09:30',

    // Assignment
    assigned_to: '401',
    team_members: ['402', '405'],

    // Financial Information
    payment_status: 'Unpaid',
    deposit_amount: 0,
    subtotal: 165.0,
    tax_amount: 13.2,
    discount_amount: 10.0,
    total_amount: 180.0,

    // Communication
    customer_instructions:
      'Please call before arrival. The side gate code is 4321.',
    confirmation_sent: true,
    reminder_sent: false,

    // Dates & Timestamps
    created_at: '2025-05-01T14:30:00',
    updated_at: '2025-05-02T09:15:00',
    completed_at: null,

    // Metadata
    source: 'Phone',
    tags: ['plumbing', 'leak', 'repeat-customer'],
    recurring_job_id: null,
  });

  // Sample related data
  const [customer, setCustomer] = useState({
    id: '101',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@example.com',
    company: 'Smith Family',
    customer_since: '2023-06-15',
    lifetime_value: 1250.0,
  });

  const [property, setProperty] = useState({
    id: '201',
    address: '123 Oak Street',
    city: 'Anytown',
    state: 'CA',
    zipcode: '12345',
    property_type: 'Residential',
    square_feet: 2200,
    year_built: 2005,
    notes: 'Two-story home with finished basement',
  });

  const [assignedTech, setAssignedTech] = useState({
    id: '401',
    name: 'Mike Johnson',
    role: 'Senior Plumber',
    phone: '(555) 987-6543',
    avatar: '/api/placeholder/40/40',
  });

  const [teamMembers, setTeamMembers] = useState([
    {
      id: '402',
      name: 'Sarah Williams',
      role: 'Plumber Assistant',
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '405',
      name: 'David Chen',
      role: 'Apprentice',
      avatar: '/api/placeholder/40/40',
    },
  ]);

  // Location for map
  const [location, setLocation] = useState({
    lat: 37.7749,
    lng: -122.4194,
  });

  // Sample photos and documents
  const [jobMedia, setJobMedia] = useState([
    {
      id: '1',
      type: 'photo',
      title: 'Before: Kitchen Sink',
      url: '/api/placeholder/80/60',
      uploaded_at: '2025-05-01T14:35:00',
    },
    {
      id: '2',
      type: 'document',
      title: 'Customer Authorization',
      url: '#',
      uploaded_at: '2025-05-01T14:40:00',
    },
  ]);

  // Sample job notes/comments
  const [comments, setComments] = useState([
    {
      id: '1',
      user_id: '101',
      user_name: 'Admin User',
      text: 'Customer mentioned previous plumbing issues. Check service history.',
      created_at: '2025-05-01T14:45:00',
      is_internal: true,
    },
    {
      id: '2',
      user_id: '401',
      user_name: 'Mike Johnson',
      text: 'I have the necessary parts on my truck for this job.',
      created_at: '2025-05-02T10:15:00',
      is_internal: true,
    },
  ]);

  // Function to handle status change
  const handleStatusChange = (newStatus: JobStatus) => {
    const statusChange: StatusChange = {
      from: job.status,
      to: newStatus,
      changed_at: new Date().toISOString(),
      changed_by: 'Current User', // In real app, get this from auth context
      notes: null,
    };

    setJob({
      ...job,
      status: newStatus,
      status_history: [...job.status_history, statusChange],
      updated_at: new Date().toISOString(),
    });
    // In a real app, you would make an API call to update the status
  };

  // Function to add a new comment
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: `${comments.length + 1}`,
      user_id: 'current-user', // In real app, get from auth context
      user_name: 'Current User', // In real app, get from auth context
      text: newComment,
      created_at: new Date().toISOString(),
      is_internal: isInternalComment,
    };

    setComments([...comments, comment]);
    setNewComment('');
    // In a real app, you would make an API call to save the comment
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Function to format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to format datetime for display
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to handle back button
  const handleBack = () => {
    navigate('/jobs');
  };

  // Function to calculate job subtotal
  const calculateSubtotal = () => {
    const serviceItemsTotal = job.service_items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    const customCharges = job.custom_line_items
      .filter((item) => item.type === 'charge')
      .reduce((sum, item) => sum + item.amount, 0);

    return serviceItemsTotal + customCharges;
  };

  // Status badge color mapping
  const getStatusColor = (status: JobStatus) => {
    const statusColors: Record<JobStatus, string> = {
      New: 'bg-gray-100 text-gray-800',
      Scheduled: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-indigo-100 text-indigo-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      Completed: 'bg-green-100 text-green-800',
      Invoiced: 'bg-purple-100 text-purple-800',
      Paid: 'bg-emerald-100 text-emerald-800',
      Canceled: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Priority badge color mapping
  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-orange-100 text-orange-800',
      Urgent: 'bg-red-100 text-red-800',
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Payment status badge color mapping
  const getPaymentStatusColor = (paymentStatus: string) => {
    const paymentStatusColors: Record<string, string> = {
      Unpaid: 'bg-yellow-100 text-yellow-800',
      'Deposit Paid': 'bg-blue-100 text-blue-800',
      Partial: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Refunded: 'bg-red-100 text-red-800',
      'Written Off': 'bg-gray-100 text-gray-800',
    };
    return paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  // Handle send reminder
  const handleSendReminder = () => {
    setJob({ ...job, reminder_sent: true });
    // In a real app, make API call to send reminder
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar />
        </div>

        {/* Main content */}
        <div className='px-4 pb-6'>
          {/* Page header */}
          <div className='pb-4 mb-6 flex items-center justify-between border-b border-gray-200'>
            <div className='flex items-center'>
              <button
                onClick={handleBack}
                className='mr-4 p-2 rounded-full hover:bg-gray-100'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-gray-500'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              <div>
                <div className='flex items-center gap-2'>
                  <p className='text-gray-500 text-sm'>Job #{job.id}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {jobDetails?.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      jobDetails?.priority as string
                    )}`}
                  >
                    {jobDetails?.priority}
                  </span>
                </div>
                <h1 className='text-heading text-2xl font-bold'>
                  {jobDetails?.title === '' ? 'Job #1' : jobDetails?.title}
                </h1>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button className='px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 inline mr-1'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                  />
                </svg>
                Print
              </button>
              <CustomButton
                title='Edit Job'
                // handleBtnClick={() => setIsEditJobModalOpen(true)}
              />
            </div>
          </div>

          {/* Tab navigation */}
          <div className='border-b border-gray-200 mb-6'>
            <nav className='-mb-px flex space-x-8'>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Schedule & Team
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Services & Billing
              </button>
              <button
                onClick={() => setActiveTab('communication')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'communication'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notes & Activity
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Photos & Documents
              </button>
            </nav>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Left column - Main job details */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Status & Actions */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='font-semibold text-lg'>Job Status</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        jobDetails?.status
                      )}`}
                    >
                      {jobDetails?.status}
                    </span>
                  </div>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'New'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('New')}
                    >
                      New
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'scheduled'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('Scheduled')}
                    >
                      Scheduled
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'Confirmed'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('Confirmed')}
                    >
                      Confirmed
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'In Progress'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('In Progress')}
                    >
                      In Progress
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'On Hold'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('On Hold')}
                    >
                      On Hold
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'Completed'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('Completed')}
                    >
                      Completed
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'Invoiced'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('Invoiced')}
                    >
                      Invoiced
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                        jobDetails?.status === 'Canceled'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange('Canceled')}
                    >
                      Canceled
                    </button>
                  </div>
                </div>

                {/* Job Description */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>
                    Job Description
                  </h2>
                  <p className='text-gray-700 mb-4'>
                    {jobDetails?.description}
                  </p>
                  <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                    <div className='flex'>
                      <div className='flex-shrink-0'>
                        <svg
                          className='h-5 w-5 text-yellow-400'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-sm font-medium text-yellow-800'>
                          Customer Instructions:
                        </h3>
                        <div className='mt-2 text-sm text-yellow-700'>
                          <p>{job.customer_instructions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='font-semibold text-lg'>Internal Notes</h2>
                    <span className='bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs'>
                      Staff Only
                    </span>
                  </div>
                  <p className='text-gray-700'>{job.internal_notes}</p>
                </div>

                {/* Tags */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>Tags</h2>
                  <div className='flex flex-wrap gap-2'>
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                      >
                        {tag}
                      </span>
                    ))}
                    <button className='bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 mr-1'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>Status History</h2>
                  <div className='space-y-4'>
                    {[...job.status_history].reverse().map((status, index) => (
                      <div key={index} className='flex'>
                        <div className='flex-shrink-0 mr-3'>
                          <div className='w-3 h-3 bg-blue-500 rounded-full mt-1.5'></div>
                          {index !== job.status_history.length - 1 && (
                            <div className='w-0.5 h-full bg-gray-200 ml-1.5'></div>
                          )}
                        </div>
                        <div>
                          <p className='text-sm font-medium'>
                            Status changed from{' '}
                            <span className='font-bold'>{status.from}</span> to{' '}
                            <span className='font-bold'>{status.to}</span>
                          </p>
                          <p className='text-xs text-gray-500'>
                            By {status.changed_by} at{' '}
                            {formatDateTime(status.changed_at)}
                          </p>
                          {status.notes && (
                            <p className='text-xs text-gray-700 mt-1'>
                              {status.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className='flex'>
                      <div className='flex-shrink-0 mr-3'>
                        <div className='w-3 h-3 bg-blue-500 rounded-full mt-1.5'></div>
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Job created</p>
                        <p className='text-xs text-gray-500'>
                          {formatDateTime(job.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Customer and Property info */}
              <div className='space-y-6'>
                {/* Quick Actions Card */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>Quick Actions</h2>
                  <div className='space-y-3'>
                    <button className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 mr-2'
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
                      Create Invoice
                    </button>
                    <button
                      className='w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center'
                      onClick={handleSendReminder}
                      disabled={job.reminder_sent}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 mr-2'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                        />
                      </svg>
                      {job.reminder_sent ? 'Reminder Sent' : 'Send Reminder'}
                    </button>
                    <button className='w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 mr-2'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                      </svg>
                      Call Customer
                    </button>
                  </div>
                </div>

                {/* Customer Card */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-start mb-4'>
                    <h2 className='font-semibold text-lg'>Customer</h2>
                    <button className='text-blue-600 hover:text-blue-800 text-sm'>
                      View Profile
                    </button>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex items-center'>
                      <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold mr-3'>
                        {jobDetails?.customer.firstName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className='font-medium'>
                          {jobDetails?.customer.firstName}{' '}
                          {jobDetails?.customer.lastName}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {jobDetails?.customer.companyName}
                        </p>
                      </div>
                    </div>
                    <div className='pt-2'>
                      <div className='flex items-start mb-2'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-gray-400 mr-2 mt-0.5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                          />
                        </svg>
                        <div>
                          <p className='text-sm'>
                            {jobDetails?.customer?.customerPhones[0]
                              ?.phoneNumber ?? 'nema broja'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start mb-2'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-gray-400 mr-2 mt-0.5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          />
                        </svg>
                        <div>
                          <p className='text-sm'>
                            {jobDetails?.customer.email[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='pt-2'>
                      <div className='text-sm'>
                        <span className='text-gray-500'>Customer since:</span>{' '}
                        {formatDate(customer.customer_since)}
                      </div>
                      <div className='text-sm'>
                        <span className='text-gray-500'>Lifetime value:</span> $
                        {customer.lifetime_value.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Card */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-start mb-4'>
                    <h2 className='font-semibold text-lg'>Property</h2>
                    <button className='text-blue-600 hover:text-blue-800 text-sm'>
                      View Details
                    </button>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex items-start'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 text-gray-400 mr-2 mt-0.5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                        />
                      </svg>
                      <div>
                        <p className='text-sm font-medium'>
                          {jobDetails?.customer.properties[0].street}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {jobDetails?.customer.properties[0].city},{' '}
                          {jobDetails?.customer.properties[0].state}{' '}
                          {jobDetails?.customer.properties[0].postalCode}
                        </p>
                      </div>
                    </div>
                    {/* <div className='pt-2'>
                      <div className='text-sm'>
                        <span className='text-gray-500'>Property type:</span>{' '}
                        {property.property_type}
                      </div>
                      <div className='text-sm'>
                        <span className='text-gray-500'>Size:</span>{' '}
                        {property.square_feet} sq ft
                      </div>
                      <div className='text-sm'>
                        <span className='text-gray-500'>Year built:</span>{' '}
                        {property.year_built}
                      </div>
                    </div>
                    <div className='pt-2'>
                      <p className='text-sm text-gray-500 font-medium mb-2'>
                        Notes:
                      </p>
                      <p className='text-sm'>{property.notes}</p>
                    </div> */}
                  </div>
                </div>

                {/* Map Card */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>Location</h2>
                  <div className='h-48 bg-gray-200 rounded-md flex items-center justify-center'>
                    <p className='text-gray-500 text-sm'>
                      Map would display here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule & Team Tab */}
          {activeTab === 'schedule' && (
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Left column - Schedule details */}
              <div className='lg:col-span-2 space-y-6'>
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>
                    Schedule Information
                  </h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-gray-500 text-sm mb-1'>
                        Scheduled Date
                      </p>
                      <p className='font-medium'>
                        {formatDate(jobDetails?.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500 text-sm mb-1'>
                        Scheduled Time
                      </p>
                      <p className='font-medium'>
                        {formatTime(jobDetails?.startTime)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500 text-sm mb-1'>
                        Arrival Window
                      </p>
                      <p className='font-medium'>
                        {formatTime(jobDetails?.arrivalWindowStart)} -{' '}
                        {formatTime(jobDetails?.arrivalWindowEnd)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500 text-sm mb-1'>
                        Estimated Duration
                      </p>
                      <p className='font-medium'>
                        {jobDetails?.estimatedDurationMinutes} minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>
                    Schedule Calendar
                  </h2>
                  <div className='h-80 bg-gray-50 rounded border border-gray-200 flex items-center justify-center'>
                    <p className='text-gray-500'>
                      Calendar view would be displayed here
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column - Team information */}
              <div className='space-y-6'>
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-start mb-4'>
                    <h2 className='font-semibold text-lg'>
                      Assigned Technician
                    </h2>
                    <button className='text-blue-600 hover:text-blue-800 text-sm'>
                      Change
                    </button>
                  </div>
                  <div className='flex items-center mb-4'>
                    <img
                      src={assignedTech.avatar}
                      alt={assignedTech.name}
                      className='w-12 h-12 rounded-full mr-4'
                    />
                    <div>
                      <p className='font-medium'>{assignedTech.name}</p>
                      <p className='text-sm text-gray-500'>
                        {assignedTech.role}
                      </p>
                    </div>
                  </div>
                  <div className='pt-2'>
                    <div className='flex items-start mb-2'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 text-gray-400 mr-2 mt-0.5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                      </svg>
                      <div>
                        <p className='text-sm'>{assignedTech.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-start mb-4'>
                    <h2 className='font-semibold text-lg'>Team Members</h2>
                    <button className='text-blue-600 hover:text-blue-800 text-sm'>
                      Add Member
                    </button>
                  </div>
                  <div className='space-y-4'>
                    {teamMembers.map((member) => (
                      <div key={member.id} className='flex items-center'>
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='w-10 h-10 rounded-full mr-3'
                        />
                        <div>
                          <p className='font-medium'>{member.name}</p>
                          <p className='text-sm text-gray-500'>{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services & Billing Tab */}
          {activeTab === 'financials' && (
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Left column - Service details */}
              <div className='lg:col-span-2 space-y-6'>
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='font-semibold text-lg'>
                      Services & Line Items
                    </h2>
                    <button className='text-blue-600 hover:text-blue-800 text-sm'>
                      Add Item
                    </button>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead>
                        <tr>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Service
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Qty
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Unit Price
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {jobDetails?.lineItems.map((item, index) => (
                          <tr key={index}>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm font-medium text-gray-900'>
                                {item.serviceItem?.name}
                              </div>
                              {item.serviceItem?.description && (
                                <div className='text-xs text-gray-500'>
                                  {item.serviceItem?.description}
                                </div>
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right'>
                              {item.quantity}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right'>
                              ${item.serviceItem?.unitPrice.toFixed(2)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                              ${item.serviceItem?.unitPrice.toFixed(2)}
                            </td>
                          </tr>
                        ))}

                        {/* Custom line items */}
                        {job.custom_line_items.map((item, index) => (
                          <tr key={`custom-${index}`}>
                            <td
                              className='px-6 py-4 whitespace-nowrap'
                              colSpan={3}
                            >
                              <div className='text-sm font-medium text-gray-900'>
                                {item.description}
                              </div>
                              <div className='text-xs text-gray-500'>
                                {item.type === 'charge'
                                  ? 'Additional Charge'
                                  : 'Discount'}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-right'>
                              <span
                                className={
                                  item.type === 'discount'
                                    ? 'text-red-600'
                                    : 'text-gray-900'
                                }
                              >
                                {item.type === 'discount' ? '-' : ''}$
                                {Math.abs(item.amount).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right column - Payment information */}
              <div className='space-y-6'>
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='font-semibold text-lg'>Payment Summary</h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        job.payment_status
                      )}`}
                    >
                      {job.payment_status}
                    </span>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500'>Subtotal</span>
                      <span className='font-medium'>
                        ${job.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500'>Tax</span>
                      <span className='font-medium'>
                        ${job.tax_amount.toFixed(2)}
                      </span>
                    </div>
                    {job.discount_amount > 0 && (
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Discount</span>
                        <span className='font-medium text-red-600'>
                          -${job.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className='pt-2 border-t border-gray-200 flex justify-between items-center font-bold'>
                      <span>Total</span>
                      <span>${job.total_amount.toFixed(2)}</span>
                    </div>
                    {job.deposit_amount > 0 && (
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-500'>Deposit</span>
                        <span className='font-medium'>
                          ${job.deposit_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {job.deposit_amount > 0 && (
                      <div className='pt-2 border-t border-gray-200 flex justify-between items-center font-bold'>
                        <span>Balance Due</span>
                        <span>
                          ${(job.total_amount - job.deposit_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='mt-6'>
                    <button className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                      Process Payment
                    </button>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h2 className='font-semibold text-lg mb-4'>
                    Financial Details
                  </h2>
                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500 text-sm'>
                        Payment Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          job.payment_status
                        )}`}
                      >
                        {job.payment_status}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500 text-sm'>Invoice #</span>
                      <span className='text-sm'>Not yet generated</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-500 text-sm'>Source</span>
                      <span className='text-sm'>{job.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes & Activity Tab */}
          {activeTab === 'communication' && (
            <div className='space-y-6'>
              {/* Add a note */}
              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                <h2 className='font-semibold text-lg mb-4'>Add Note</h2>
                <div className='space-y-4'>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className='w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    rows={3}
                    placeholder='Add a note or comment...'
                  />
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='internal-comment'
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <label
                        htmlFor='internal-comment'
                        className='ml-2 block text-sm text-gray-700'
                      >
                        Internal note (hidden from customer)
                      </label>
                    </div>
                    <button
                      onClick={handleAddComment}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium'
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes & Activity Timeline */}
              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                <h2 className='font-semibold text-lg mb-4'>Notes & Activity</h2>
                <div className='space-y-6'>
                  {[...comments].reverse().map((comment) => (
                    <div key={comment.id} className='flex space-x-3'>
                      <div className='flex-shrink-0'>
                        <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium'>
                          {comment.user_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      </div>
                      <div className='flex-1 bg-gray-50 p-4 rounded-lg'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='font-medium'>
                            {comment.user_name}
                          </span>
                          <div className='flex items-center'>
                            {comment.is_internal && (
                              <span className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs mr-2'>
                                Internal
                              </span>
                            )}
                            <span className='text-xs text-gray-500'>
                              {formatDateTime(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className='text-gray-700'>{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Photos & Documents Tab */}
          {activeTab === 'documents' && (
            <div className='space-y-6'>
              {/* Upload Section */}
              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                <h2 className='font-semibold text-lg mb-4'>Upload Files</h2>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    stroke='currentColor'
                    fill='none'
                    viewBox='0 0 48 48'
                  >
                    <path
                      d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <div className='mt-4 flex text-sm text-gray-600 justify-center'>
                    <label
                      htmlFor='file-upload'
                      className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none'
                    >
                      <span>Upload a file</span>
                      <input
                        id='file-upload'
                        name='file-upload'
                        type='file'
                        className='sr-only'
                      />
                    </label>
                    <p className='pl-1'>or drag and drop</p>
                  </div>
                  <p className='text-xs text-gray-500'>
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>

              {/* Photos and Documents List */}
              <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                <h2 className='font-semibold text-lg mb-4'>
                  Photos & Documents
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {jobMedia.map((media) => (
                    <div
                      key={media.id}
                      className='border border-gray-200 rounded-lg overflow-hidden'
                    >
                      {media.type === 'photo' ? (
                        <div className='h-40 bg-gray-100 flex items-center justify-center'>
                          <img
                            src={media.url}
                            alt={media.title}
                            className='max-h-full w-auto'
                          />
                        </div>
                      ) : (
                        <div className='h-40 bg-gray-50 flex items-center justify-center'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-12 w-12 text-gray-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                        </div>
                      )}
                      <div className='p-3'>
                        <div className='flex items-center justify-between mb-1'>
                          <p className='font-medium text-sm'>{media.title}</p>
                          <span className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs'>
                            {media.type}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500'>
                          {formatDateTime(media.uploaded_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
