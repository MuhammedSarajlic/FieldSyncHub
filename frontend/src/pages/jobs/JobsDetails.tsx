import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useNavigate, useParams } from 'react-router';
import { TJob } from '../../types/Job';
import { TRecordInvoicePayment } from '../../types/Invoice';
import {
  ChangeJobStatus,
  DeleteJob,
  GetJobById,
  RecordJobDepositPayment,
} from '../../services/Job';
import {
  JobPriority,
  JobStatus,
  JobType,
  PaymentStatus,
} from '../../constants/Enumeration/JobEnum/JobEnum';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import {
  MapPin,
  User,
  Phone,
  Mail,
  Edit3,
  MoreVertical,
  X,
  Copy,
  Archive,
  Printer,
  Download,
  Receipt,
  CalendarClock,
  Trash2,
  Send,
  Star,
  Plus,
  MapIcon,
  Wallet,
} from 'lucide-react';
import { getJobPriority } from '../../utils/FuntionHelpers/JobUtils/getJobPriority';
import { getJobStatus } from '../../utils/FuntionHelpers/JobUtils/getJobStatus';
import { getPaymentStatusColor } from '../../utils/FuntionHelpers/JobUtils/getPaymentStatusColor';
import JobDetailsMediaTab from '../../components/Jobs/JobDetails/JobDetailsTabs/JobDetailsMediaTab';
import PageLoader from '../../components/CustomElements/Loaders/PageLoader';
import IconButton from '../../components/CustomElements/Buttons/IconButton';
import CustomButton from '../../components/CustomElements/Buttons/CustomButton';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { useClickOutside } from '../../hooks/useClickOutside'; // Assuming you have this hook from QuoteDetails
import { formatTime } from '../../utils/FuntionHelpers/formatTime';
import EditJobModal from '../../components/Jobs/JobsModal/EditJobModal';
import RecordPaymentModal from '../../components/Invoice/Modal/RecordPaymentModal';
import { formatPercent } from '../../utils/FuntionHelpers/formatPercent';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [jobDetails, setJobDetails] = useState<TJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState<boolean>(false);
  const [isRecordDepositModalOpen, setIsRecordDepositModalOpen] =
    useState<boolean>(false);

  const fetchJobById = async () => {
    if (!jobId) return;
    setIsLoading(true);
    const response = await GetJobById(jobId);
    if (response.status === 200) {
      setJobDetails(response.data.payload);
    }
    setIsLoading(false);
  };

  const handleRecordDepositPayment = async (payment: TRecordInvoicePayment) => {
    if (!jobId) return;

    try {
      await RecordJobDepositPayment(jobId, payment);
      await fetchJobById();
    } catch (err) {
      const message =
        (err as { response?: { data?: { errorMessage?: string } } })
          ?.response?.data?.errorMessage ??
        'Could not record the deposit payment.';
      throw new Error(message);
    }
  };

  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const handleMarkJobCompleted = async () => {
    if (!jobId) return;

    setIsMarkingComplete(true);
    try {
      await ChangeJobStatus(jobId, JobStatus.Completed);
      await fetchJobById();
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const [showMoreActions, setShowMoreActions] = useState(false);
  const showMoreRef = useClickOutside<HTMLDivElement>(() =>
    setShowMoreActions(false)
  );

  const [jobMedia] = useState([
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

  // Handle send reminder (keeping it as a placeholder as in original)
  const handleSendReminder = () => {
    if (jobDetails) {
      setJobDetails({ ...jobDetails, ReminderSent: true }); // Assuming ReminderSent exists
      // In a real app, make API call to send reminder
    }
  };

  const handleDeleteJob = async () => {
    if (!jobId) return;
    const response = await DeleteJob(jobId);
    if (response.status === 200) {
      navigate('/jobs');
    }
  };

  const handlePrintJobDetails = () => {
    // Implement print logic here, similar to QuoteDetails
  };

  const handleDownloadJobDetails = () => {
    // Implement download logic here, similar to QuoteDetails
  };

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const getPropertyPosition = async () => {
    if (!jobDetails?.property?.address) {
      return;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        jobDetails.property.address
      )}`
    );
    const data = await response.json();

    if (data.length > 0) {
      setLat(parseFloat(data[0].lat));
      setLon(parseFloat(data[0].lon));
    }
  };

  useEffect(() => {
    fetchJobById();
  }, [jobId]);

  useEffect(() => {
    if (jobDetails?.property?.address) {
      getPropertyPosition();
    }
  }, [jobDetails?.property?.address]);

  if (!jobDetails) return <p>Loading</p>;

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />

        {!isLoading && jobDetails ? (
          <>
            <div className='shadow-sm'>
              <div className='px-6'>
                <div className='flex items-center justify-between py-6'>
                  <div>
                    <h1 className='text-2xl font-bold text-text-primary'>
                      {jobDetails.title}
                    </h1>
                    <p className='text-sm text-gray-500'>
                      Job #{jobDetails.jobNumber}
                    </p>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <IconButton
                      icon={<Edit3 className='w-4 h-4 mr-2' />}
                      onClick={() => setIsEditJobModalOpen(true)}
                      customStyle='py-2 px-4 bg-bg-primary border-none text-white hover:bg-bg-primary-hover'
                    >
                      Edit
                    </IconButton>
                    <div className='relative'>
                      <IconButton
                        icon={<MoreVertical className='w-4 h-4 mr-2' />}
                        customStyle='py-2 px-4 hover:border-gray-300'
                        onClick={() => setShowMoreActions(!showMoreActions)}
                      >
                        More
                      </IconButton>

                      {showMoreActions && (
                        <>
                          <div
                            className='fixed inset-0 z-10'
                            onClick={() => setShowMoreActions(false)}
                          ></div>
                          <div
                            ref={showMoreRef}
                            className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 transform origin-top-right animate-fade-in-down'
                          >
                            <div className='py-1'>
                              {/* Quick Actions moved here */}
                              <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                                Quick Actions
                              </div>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Send className='w-4 h-4 mr-2 text-gray-500' />
                                Send Message
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Receipt className='w-4 h-4 mr-2 text-gray-500' />
                                Send Invoice
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <CalendarClock className='w-4 h-4 mr-2 text-gray-500' />
                                Reschedule
                              </button>
                              {/* Other actions */}
                              <div className='border-t border-gray-100 my-1'></div>
                              <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                                Other Actions
                              </div>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Copy className='w-4 h-4 mr-2 text-gray-500' />
                                Duplicate Job
                              </button>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <X className='w-4 h-4 mr-2 text-gray-500' />
                                Cancel Job
                              </button>
                              <button
                                onClick={handlePrintJobDetails}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'
                              >
                                <Printer className='w-4 h-4 mr-2 text-gray-500' />
                                Print Details
                              </button>
                              <button
                                onClick={handleDownloadJobDetails}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'
                              >
                                <Download className='w-4 h-4 mr-2 text-gray-500' />
                                Download Details
                              </button>
                              <div className='border-t border-gray-100 my-1'></div>
                              <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors'>
                                <Archive className='w-4 h-4 mr-2 text-gray-500' />
                                Archive Job
                              </button>
                              <button
                                onClick={handleDeleteJob}
                                className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors'
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
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

            <div className='p-6'>
              <div className='flex w-full gap-6'>
                {/* Main Content */}
                <div className='w-3/4'>
                  {/* Tabs */}
                  <div className=' overflow-hidden'>
                    <div className='border-b border-gray-200'>
                      <nav className='flex space-x-8 '>
                        {['overview', 'media & files'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors cursor-pointer ${
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

                    <div className='py-6'>
                      {activeTab === 'overview' && (
                        <div className='space-y-6 divide-y divide-gray-200'>
                          {/* Job Status, Priority, Payment Info */}

                          {/* Description */}
                          <div className='pb-6 px-2'>
                            <h3 className='text-xl font-semibold text-text-primary mb-2'>
                              Description
                            </h3>
                            {jobDetails.description ? (
                              <p className='text-gray-700 text-sm leading-relaxed'>
                                {jobDetails.description}
                              </p>
                            ) : (
                              <p className='text-gray-500 text-sm italic'>
                                Description not provided
                              </p>
                            )}
                          </div>

                          {/* Job Schedule */}
                          <div className='pb-6 px-2'>
                            <h2 className='font-semibold text-xl mb-4 text-text-primary'>
                              Job Information
                            </h2>
                            <div className='grid grid-cols-3 gap-6'>
                              <div>
                                <p className='text-gray-500 text-sm mb-1'>
                                  Scheduled Date
                                </p>
                                <p className='font-medium'>
                                  {formatDate(jobDetails.startDate)}
                                </p>
                              </div>
                              <div>
                                <p className='text-gray-500 text-sm mb-1'>
                                  Scheduled Time
                                </p>
                                <p className='font-medium'>
                                  {formatTime(jobDetails.startTime)}
                                </p>
                              </div>
                              {/* Status */}
                              <div className='flex items-center space-x-3'>
                                <div>
                                  <p className='text-sm text-gray-600'>
                                    Status
                                  </p>
                                  <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${
                                      getJobStatus(jobDetails.status).color
                                    }`}
                                  >
                                    {getJobStatus(jobDetails.status).icon}
                                    {JobStatus[jobDetails.status]}
                                  </div>
                                </div>
                                {jobDetails.status !== JobStatus.Completed &&
                                  jobDetails.status !==
                                    JobStatus.Canceled && (
                                    <CustomButton
                                      onClick={handleMarkJobCompleted}
                                      disabled={isMarkingComplete}
                                      customStyle='self-end py-1.5 px-3 text-xs border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                                    >
                                      {isMarkingComplete
                                        ? 'Marking complete...'
                                        : 'Mark as completed'}
                                    </CustomButton>
                                  )}
                              </div>
                              <div>
                                <p className='text-gray-500 text-sm mb-1'>
                                  Arrival Window
                                </p>
                                <p className='font-medium'>
                                  {formatTime(jobDetails.startTime)} -{' '}
                                  {formatTime(jobDetails.startTime)}
                                </p>
                              </div>
                              <div>
                                <p className='text-gray-500 text-sm mb-1'>
                                  Estimated Duration
                                </p>
                                <p className='font-medium'>
                                  {jobDetails.estimatedDurationMinutes > 59
                                    ? `${
                                        jobDetails.estimatedDurationMinutes / 60
                                      } hours`
                                    : `${jobDetails.estimatedDurationMinutes} minutes`}
                                </p>
                              </div>

                              {/* Priority */}
                              <div className='flex items-center space-x-3'>
                                <div>
                                  <p className='text-sm text-gray-600'>
                                    Priority
                                  </p>
                                  <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 border ${getJobPriority(
                                      jobDetails.priority
                                    )}`}
                                  >
                                    <Star className='w-3 h-3 mr-2 fill-current' />
                                    {JobPriority[jobDetails.priority]}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Line Items */}
                          <div className='bg-white overflow-hidden pb-6 px-2'>
                            <h2 className='font-semibold text-xl mb-4 text-text-primary'>
                              Line items
                            </h2>
                            <div className='overflow-x-auto '>
                              <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                  <tr>
                                    <th className='w-1/2 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left'>
                                      Item
                                    </th>
                                    <th className='w-1/6 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right'>
                                      Qty
                                    </th>
                                    <th className='w-1/6 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right'>
                                      Unit Price
                                    </th>
                                    <th className='w-1/6 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right'>
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                  {jobDetails?.lineItems.map((item) => (
                                    <tr key={item.id}>
                                      <td className='w-1/2 px-6 py-4'>
                                        <div className='flex-1 min-w-0'>
                                          <p className='text-sm font-medium text-gray-900 truncate'>
                                            {item.name}{' '}
                                            {item.isOptional && (
                                              <span className='text-xs text-gray-500'>
                                                (Optional)
                                              </span>
                                            )}
                                          </p>
                                          <p className='text-sm text-gray-500'>
                                            {item.description}
                                          </p>
                                        </div>
                                      </td>
                                      <td className='w-1/6 px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900'>
                                        {item.quantity}
                                      </td>
                                      <td className='w-1/6 px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900'>
                                        {formatCurrency(item.unitPrice)}
                                      </td>
                                      <td className='w-1/6 px-6 py-4 text-right whitespace-nowrap text-sm font-medium text-gray-900'>
                                        {formatCurrency(
                                          item.quantity * item.unitPrice
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Enhanced Pricing Summary */}
                            <div className='p-6 border-t border-gray-200'>
                              <div className='flex justify-end'>
                                <div className='w-2/5 space-y-2'>
                                  {[
                                    {
                                      label: 'Subtotal:',
                                      value: `${formatCurrency(
                                        jobDetails?.subtotal
                                      )}`,
                                      color: 'text-gray-900',
                                    },
                                    jobDetails.discountValue > 0 && {
                                      label: `Discount (${
                                        jobDetails?.discountValue
                                      }${
                                        jobDetails?.discountType === 0
                                          ? '%'
                                          : '$'
                                      }):`,
                                      value: `-${formatCurrency(
                                        jobDetails?.discount
                                      )}`,
                                      color: 'text-green-600',
                                    },
                                    {
                                      label: `Tax (${formatPercent(
                                        jobDetails?.taxRate * 100
                                      )}%):`,
                                      value: `${formatCurrency(
                                        jobDetails?.taxAmount
                                      )}`,
                                      color: 'text-gray-900',
                                    },
                                    {
                                      label: 'Total:',
                                      value: `${formatCurrency(
                                        jobDetails?.totalAmount
                                      )}`,
                                      color: 'text-text-primary',
                                      isTotal: true,
                                      customColor: 'text-text-primary',
                                    },
                                    jobDetails.depositAmount > 0 && {
                                      label: 'Deposit paid:',
                                      value: `${formatCurrency(
                                        jobDetails.depositPaid
                                      )} / ${formatCurrency(
                                        jobDetails.depositAmount
                                      )}`,
                                      color: jobDetails.isDepositPaid
                                        ? 'text-green-600'
                                        : 'text-gray-900',
                                    },
                                    jobDetails.depositAmount > 0 && {
                                      label: 'Deposit balance due:',
                                      value: `${formatCurrency(
                                        jobDetails.depositBalanceDue
                                      )}`,
                                      color:
                                        jobDetails.depositBalanceDue > 0
                                          ? 'text-red-600'
                                          : 'text-green-600',
                                    },
                                  ]
                                    .filter(Boolean)
                                    .map(
                                      (
                                        item,
                                        index // Filter Boolean to remove false for conditional items
                                      ) => (
                                        <div
                                          key={index}
                                          className={`flex justify-between ${
                                            item?.isTotal
                                              ? 'pt-2 border-t border-gray-200'
                                              : ''
                                          }`}
                                        >
                                          <span
                                            className={`${
                                              item?.isTotal
                                                ? 'font-semibold text-text-primary'
                                                : 'text-gray-600'
                                            }`}
                                          >
                                            {item?.label}
                                          </span>
                                          <span
                                            className={`${
                                              item?.isTotal
                                                ? 'font-semibold'
                                                : 'font-medium'
                                            } ${item?.color}`}
                                            style={
                                              item?.customColor
                                                ? { color: item.customColor }
                                                : {}
                                            }
                                          >
                                            {item?.value}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  {jobDetails.depositAmount > 0 &&
                                    jobDetails.depositBalanceDue > 0 && (
                                      <div className='flex justify-end pt-2'>
                                        <IconButton
                                          icon={
                                            <Wallet className='mr-2 h-4 w-4' />
                                          }
                                          onClick={() =>
                                            setIsRecordDepositModalOpen(true)
                                          }
                                          customStyle='border-transparent bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 text-sm'
                                        >
                                          Record deposit payment
                                        </IconButton>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Assigned Team Members */}
                          {jobDetails.assignedTeamMembers &&
                            jobDetails.assignedTeamMembers.length > 0 && (
                              <div className='pb-6 px-2'>
                                <h3 className='font-semibold text-xl mb-4 text-text-primary'>
                                  Assigned Team
                                </h3>
                                <div className='space-y-3'>
                                  {jobDetails.assignedTeamMembers.map(
                                    (member) => (
                                      <div
                                        key={member.id}
                                        className='flex items-center space-x-3'
                                      >
                                        <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium text-sm'>
                                          {member.user.fullName.charAt(0)}
                                        </div>
                                        <p className='text-sm font-medium text-gray-900'>
                                          {member.user.fullName}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Job Status History (Timeline) */}
                          {jobDetails.statusHistory &&
                            jobDetails.statusHistory.length > 0 && (
                              <div className='bg-white rounded-xl shadow border border-gray-200 p-6'>
                                <div className='flex items-center justify-between mb-6'>
                                  <h3 className='font-semibold text-xl mb-4 text-text-primary'>
                                    Job Activity History
                                  </h3>
                                </div>
                              </div>
                            )}

                          {/* Customer Notes */}
                          {jobDetails.customerNotes && (
                            <div className='bg-white pb-6 px-2'>
                              <h3 className='font-semibold text-xl mb-4 text-text-primary'>
                                Customer Notes
                              </h3>

                              <p className='text-sm text-gray-700 leading-relaxed'>
                                {jobDetails.customerNotes}
                              </p>
                            </div>
                          )}

                          {/* Internal Notes */}
                          {jobDetails.internalNotes && (
                            <div className='bg-white px-2'>
                              <h3 className='font-semibold text-xl mb-4 text-text-primary'>
                                Internal Notes
                              </h3>
                              <p className='text-sm text-gray-700 leading-relaxed'>
                                {jobDetails.internalNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'media & files' && (
                        <JobDetailsMediaTab
                          jobMedia={jobMedia}
                          jobDetails={jobDetails} // Make sure this prop is compatible if TJob is changed
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className='w-1/4 space-y-6'>
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
                      {jobDetails.source && (
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Source</span>
                          <span className='text-gray-900'>
                            {jobDetails.source}
                          </span>
                        </div>
                      )}
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Type</span>
                        <span className='text-gray-900'>
                          {JobType[jobDetails.jobType]}
                        </span>
                      </div>
                      {jobDetails.completedAt && (
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Completed At</span>
                          <span className='text-gray-900'>
                            {formatDate(jobDetails.completedAt)}
                          </span>
                        </div>
                      )}

                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Invoice #</span>

                        {jobDetails.invoiceSent ? (
                          <span className='text-bg-primary font-medium hover:underline cursor-pointer'>
                            FSH-250714-0001
                          </span>
                        ) : (
                          <span className='text-text-primary'>
                            Not yet generated
                          </span>
                        )}
                      </div>

                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Payment Status</span>
                        <span
                          className={`py-0.5 px-2.5 text-xs rounded-full ${getPaymentStatusColor(
                            jobDetails.paymentStatus
                          )}`}
                        >
                          {PaymentStatus[jobDetails.paymentStatus]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Tags
                    </h3>
                    <div className='flex space-x-3'>
                      {jobDetails.tags &&
                        jobDetails.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                          >
                            {tag}
                          </span>
                        ))}
                      <IconButton
                        icon={<Plus className='w-4 h-4 mr-1' />}
                        onClick={() => {}}
                        customStyle='bg-gray-100 hover:bg-gray-200 text-gray-600! px-3 py-1 rounded-full! border-none'
                      >
                        Add Tag
                      </IconButton>
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
                        {jobDetails.customer?.customerPhones?.[0]
                          ?.phoneNumber && (
                          <div className='flex items-center text-sm text-gray-600'>
                            <Phone className='w-4 h-4 mr-3 text-gray-400' />
                            {
                              jobDetails.customer?.customerPhones?.[0]
                                .phoneNumber
                            }
                          </div>
                        )}
                        {jobDetails.customer?.emails?.[0] && (
                          <div className='flex items-center text-sm text-gray-600'>
                            <Mail className='w-4 h-4 mr-3 text-gray-400' />
                            {jobDetails.customer?.emails?.[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  {jobDetails.property?.address && (
                    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Property
                      </h3>
                      <div className='flex items-center mb-4'>
                        <MapPin className='w-5.5 h-5.5 text-gray-400 mr-3 mt-0.5' />
                        <div className='text-sm text-gray-700'>
                          <p>{jobDetails.property?.address}</p>
                        </div>
                      </div>
                      <div className='w-full h-52 rounded-xl overflow-hidden'>
                        {lat && lon ? (
                          <MapContainer
                            center={[lat, lon]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                            <Marker position={[lat, lon]}>
                              <Popup>{jobDetails.property?.address}</Popup>
                            </Marker>
                          </MapContainer>
                        ) : (
                          <div className='h-full w-full flex items-center justify-center bg-gray-300'>
                            <MapIcon className='w-10 h-10 text-gray-600' />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <PageLoader />
        )}
      </div>
      <EditJobModal
        isOpen={isEditJobModalOpen}
        onClose={() => setIsEditJobModalOpen(false)}
        jobToEdit={jobDetails}
        setJobDetails={setJobDetails}
      />
      <RecordPaymentModal
        isOpen={isRecordDepositModalOpen}
        balanceDue={jobDetails.depositBalanceDue}
        onClose={() => setIsRecordDepositModalOpen(false)}
        onSubmit={handleRecordDepositPayment}
      />
    </div>
  );
};

export default JobDetails;
