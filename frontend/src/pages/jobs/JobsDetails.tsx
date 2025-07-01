import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useParams } from 'react-router';
import { TJob } from '../../types/Job';
import { GetJobById } from '../../services/Job';
import {
  JobPriority,
  JobStatus,
  JobType,
  PaymentStatus,
} from '../../constants/Enumeration/JobEnum/JobEnum';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  Edit3,
  MessageSquare,
  MoreHorizontal,
  Star,
  CreditCard,
  Receipt,
  Loader2,
  Trash2,
  Archive,
  Printer,
  Share2,
  Download,
  Copy,
  ChevronLeft,
  CalendarClock,
  Send,
} from 'lucide-react';
import { getJobPriority } from '../../utils/FuntionHelpers/JobUtils/getJobPriority';
import { getJobStatus } from '../../utils/FuntionHelpers/JobUtils/getJobStatus';
import { getPaymentStatusColor } from '../../utils/FuntionHelpers/JobUtils/getPaymentStatusColor';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import JobDetailsOverviewTab from '../../components/Jobs/JobDetails/JobDetailsTabs/JobDetailsOverviewTab';
import JobDetailsTimelineTab from '../../components/Jobs/JobDetails/JobDetailsTabs/JobDetailsTimelineTab';
import JobDetailsBillingTab from '../../components/Jobs/JobDetails/JobDetailsTabs/JobDetailsBillingTab';
import JobDetailsTeamTab from '../../components/Jobs/JobDetails/JobDetailsTabs/JobDetailsTeamTab';
import JobDetailsMediaTab from '../../components/Jobs/JobDetails/JobDetailsTabs/JobDetailsMediaTab';
import PageLoader from '../../components/CustomElements/Loaders/PageLoader';

const JobDetails = () => {
  const { jobId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [jobDetails, setJobDetails] = useState<TJob>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchJobById = async () => {
    setIsLoading(true);
    const response = await GetJobById(jobId);
    if (response.status === 200) {
      console.log(response);
      setJobDetails(response.data.payload);
    }
    setIsLoading(false);
  };

  // Sample photos and documents
  // const [jobMedia, setJobMedia] = useState([
  //   {
  //     id: '1',
  //     type: 'photo',
  //     title: 'Before: Kitchen Sink',
  //     url: '/api/placeholder/80/60',
  //     uploaded_at: '2025-05-01T14:35:00',
  //   },
  //   {
  //     id: '2',
  //     type: 'document',
  //     title: 'Customer Authorization',
  //     url: '#',
  //     uploaded_at: '2025-05-01T14:40:00',
  //   },
  // ]);

  const [showMoreActions, setShowMoreActions] = useState(false);
  const [jobMedia, setJobMedia] = useState([
    {
      id: '1',
      type: 'photo' as const, // Use 'as const' for literal types
      title: 'Before: Kitchen Sink',
      url: 'https://via.placeholder.com/400x300/a8dadc/ffffff?text=Kitchen+Sink',
      uploaded_at: '2025-05-01T14:35:00',
      uploadedBy: 'Olivia Rhye',
      email: 'olivia@untitledui.com',
      size: '144 KB',
    },
    {
      id: '2',
      type: 'document' as const,
      title: 'Customer Authorization',
      url: 'https://www.africau.edu/images/default/sample.pdf', // A sample PDF
      uploaded_at: '2025-05-01T14:40:00',
      uploadedBy: 'Phoenix Baker',
      email: 'phoenix@untitledui.com',
      size: '64 KB',
    },
    {
      id: '3',
      type: 'photo' as const,
      title: 'During: Pipe Repair',
      url: 'https://via.placeholder.com/400x300/fec89a/ffffff?text=Pipe+Repair',
      uploaded_at: '2025-05-02T10:00:00',
      uploadedBy: 'Lana Steiner',
      email: 'lana@untitledui.com',
      size: '16 MB',
    },
    {
      id: '4',
      type: 'document' as const,
      title: 'Material List',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Another sample PDF
      uploaded_at: '2025-05-02T10:15:00',
      uploadedBy: 'Demi Wilkinson',
      email: 'demi@untitledui.com',
      size: '720 KB',
    },
  ]);

  // Handle send reminder
  const handleSendReminder = () => {
    setJob({ ...job, reminder_sent: true });
    // In a real app, make API call to send reminder
  };

  useEffect(() => {
    fetchJobById();
  }, [jobId]);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />

        {!isLoading && jobDetails ? (
          <>
            <div className='py-2 bg-white border-b border-gray-200'>
              {/* Added shadow and border-b */}
              <div className='px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                      {/* Changed to gray-900 */}
                      {jobDetails.title}
                    </h1>
                    <p className='text-sm text-gray-500'>
                      Job #{jobDetails.jobNumber}
                    </p>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <button className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md'>
                      {' '}
                      {/* Added shadow */}
                      <Edit3 className='w-4 h-4 mr-2' />
                      Edit Job
                    </button>
                    <div className='relative'>
                      <button
                        onClick={() => setShowMoreActions(!showMoreActions)}
                        className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm' // Added border and shadow
                      >
                        <MoreHorizontal className='w-5 h-5' />
                      </button>

                      {showMoreActions && (
                        <>
                          <div
                            className='fixed inset-0 z-10'
                            onClick={() => setShowMoreActions(false)}
                          ></div>
                          <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 transform origin-top-right animate-fade-in-down'>
                            {' '}
                            {/* Added shadow-xl and animation */}
                            <div className='py-1'>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Copy className='w-4 h-4 mr-3 text-gray-500' />{' '}
                                {/* Added text-gray-500 for icon */}
                                Duplicate Job
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Download className='w-4 h-4 mr-3 text-gray-500' />
                                Export PDF
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Share2 className='w-4 h-4 mr-3 text-gray-500' />
                                Share Job
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Printer className='w-4 h-4 mr-3 text-gray-500' />
                                Print Details
                              </button>
                              <div className='border-t border-gray-100 my-1'></div>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Archive className='w-4 h-4 mr-3 text-gray-500' />
                                Archive Job
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors'>
                                <Trash2 className='w-4 h-4 mr-3' />
                                Delete Job
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='px-4 sm:px-6 lg:px-8 py-8'>
              <div className='grid lg:grid-cols-4 gap-8'>
                {/* Main Content */}
                <div className='lg:col-span-3'>
                  {/* Status Cards */}
                  <div className='grid md:grid-cols-3 gap-6 mb-8'>
                    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Status
                          </p>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${
                              getJobStatus(jobDetails.status).color
                            }`}
                          >
                            {getJobStatus(jobDetails.status).icon}
                            {JobStatus[jobDetails.status]}
                          </div>
                        </div>
                        <AlertCircle className='w-8 h-8 text-orange-500' />
                      </div>
                    </div>

                    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Priority
                          </p>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 border ${getJobPriority(
                              jobDetails.priority
                            )}`}
                          >
                            <Star className='w-3 h-3 mr-2 fill-current' />
                            {JobPriority[jobDetails.priority]}
                          </div>
                        </div>
                        <Star className='w-8 h-8 text-orange-500' />
                      </div>
                    </div>

                    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Payment
                          </p>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 border ${getPaymentStatusColor(
                              jobDetails.paymentStatus
                            )}`}
                          >
                            <CreditCard className='w-3 h-3 mr-2' />
                            {PaymentStatus[jobDetails.paymentStatus]}
                          </div>
                        </div>
                        <DollarSign className='w-8 h-8 text-green-500' />
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='border-b border-gray-200'>
                      <nav className='flex space-x-8 px-6'>
                        {[
                          'overview',
                          'timeline',
                          'billing & services',
                          'team',
                          'media & files',
                        ].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                              activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </nav>
                    </div>

                    <div className='p-6'>
                      {activeTab === 'overview' && (
                        <JobDetailsOverviewTab jobDetails={jobDetails} />
                      )}

                      {activeTab === 'timeline' && (
                        <JobDetailsTimelineTab jobDetails={jobDetails} />
                      )}

                      {activeTab === 'billing & services' && (
                        <JobDetailsBillingTab jobDetails={jobDetails} />
                      )}

                      {activeTab === 'team' && (
                        <JobDetailsTeamTab jobDetails={jobDetails} />
                      )}

                      {activeTab === 'media & files' && ( // Render new tab content
                        <JobDetailsMediaTab
                          jobMedia={jobMedia}
                          jobDetails={jobDetails}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className='lg:col-span-1 space-y-6'>
                  {/* Quick Actions */}
                  <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-5'>
                      Quick Actions
                    </h3>
                    <div className='space-y-4'>
                      {/* Send Message */}
                      <button className='w-full flex items-center p-3 rounded-xl hover:bg-blue-50 transition-colors border border-blue-200 group'>
                        <div className='w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105'>
                          <Send className='w-4 h-4 text-white' />
                        </div>
                        <div className='ml-3 text-left flex-grow'>
                          <p className='text-sm font-semibold text-blue-900'>
                            Send Message
                          </p>
                          <p className='text-xs text-blue-600'>
                            Notify customer or team
                          </p>
                        </div>
                        <ChevronLeft className='w-5 h-5 text-blue-400 rotate-180 group-hover:text-blue-600 transition-colors' />
                      </button>

                      {/* Send Invoice */}
                      <button className='w-full flex items-center p-3 rounded-xl hover:bg-emerald-50 transition-colors border border-emerald-200 group'>
                        <div className='w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105'>
                          <Receipt className='w-4 h-4 text-white' />
                        </div>
                        <div className='ml-3 text-left flex-grow'>
                          <p className='text-sm font-semibold text-emerald-900'>
                            Send Invoice
                          </p>
                          <p className='text-xs text-emerald-600'>
                            Generate & send billing
                          </p>
                        </div>
                        <ChevronLeft className='w-5 h-5 text-emerald-400 rotate-180 group-hover:text-emerald-600 transition-colors' />
                      </button>

                      {/* Reschedule */}
                      <button className='w-full flex items-center p-3 rounded-xl hover:bg-amber-50 transition-colors border border-amber-200 group'>
                        <div className='w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105'>
                          <CalendarClock className='w-4 h-4 text-white' />
                        </div>
                        <div className='ml-3 text-left flex-grow'>
                          <p className='text-sm font-semibold text-amber-900'>
                            Reschedule
                          </p>
                          <p className='text-xs text-amber-600'>
                            Change appointment time
                          </p>
                        </div>
                        <ChevronLeft className='w-5 h-5 text-amber-400 rotate-180 group-hover:text-amber-600 transition-colors' />
                      </button>
                    </div>
                  </div>

                  {/* Job Meta */}
                  <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Job Details
                    </h3>
                    <div className='space-y-3 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Created</span>
                        <span className='text-gray-900'>
                          {formatDate(jobDetails.createdAt)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Source</span>
                        <span className='text-gray-900'>
                          {jobDetails.source}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Duration</span>
                        <span className='text-gray-900'>
                          {jobDetails.estimatedDurationMinutes / 60}h
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Type</span>
                        <span className='text-gray-900'>
                          {JobType[jobDetails.jobType]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Customer
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <User className='w-5 h-5 text-blue-600' />
                        </div>
                        <div className='ml-3'>
                          <p className='text-sm font-medium text-gray-900'>
                            {jobDetails.customer?.fullName}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {jobDetails.customer?.companyName}
                          </p>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center text-sm text-gray-600'>
                          <Phone className='w-4 h-4 mr-3 text-gray-400' />
                          {jobDetails.customer?.customerPhones?.[0].phoneNumber}
                        </div>
                        <div className='flex items-center text-sm text-gray-600'>
                          <Mail className='w-4 h-4 mr-3 text-gray-400' />
                          {jobDetails.customer?.emails?.[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Property
                    </h3>
                    <div className='flex items-start'>
                      <MapPin className='w-5 h-5 text-gray-400 mr-3 mt-0.5' />
                      <div className='text-sm text-gray-700'>
                        <p>{jobDetails.property?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <PageLoader />
        )}
      </div>
    </div>
  );
};

export default JobDetails;
