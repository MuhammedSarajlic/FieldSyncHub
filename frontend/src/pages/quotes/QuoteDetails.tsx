import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Send,
  Download,
  Plus,
  Archive,
  Printer,
  Check,
  X,
  CopyIcon,
  Eye,
  HardHat,
  MoreVertical,
  Briefcase,
  Calendar,
  Trash2,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import { useClickOutside } from '../../hooks/useClickOutside';
import IconButton from '../../components/CustomElements/Buttons/IconButton';
import { getQuoteStatus } from '../../utils/FuntionHelpers/getQuoteStatus';
import QuoteNote from '../../components/Quotes/QuoteNotes/QuoteNote';
import { TQuote, TQuoteAttachment } from '../../types/Quote';
import { useNavigate, useParams } from 'react-router';
import {
  AddQuoteCustomerNote,
  AddQuoteInternalNote,
  ArchiveQuote,
  ChangeQuoteStatus,
  DeleteQuote,
  GetQuoteById,
  GetQuotePdf,
} from '../../services/Quote';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import {
  QuoteActivityType,
  QuoteStatus,
} from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import CustomButton from '../../components/CustomElements/Buttons/CustomButton';
import { TAddNote, TNote } from '../../types/Note';
import { useAuth } from '../../context/AuthProvider';
import { DateTime } from 'luxon';
import QuoteAttachments from '../../components/Quotes/QuoteAttachments/QuoteAttachments';
import { getQuoteActivityStyle } from '../../utils/FuntionHelpers/QuoteUtils/getQuoteActivityStyle';
import SendQuoteModal from '../../components/Quotes/QuotesModals/SendQuoteModal';
import ActionConfirmationModal from '../../components/Quotes/QuotesModals/ActionConfirmationModal';
import EditQuoteModal from '../../components/Quotes/QuotesModals/EditQuoteModal';
import {
  downloadPdfFile,
  openPdfAndPrint,
} from '../../utils/FuntionHelpers/downloadPdfFile';
import ConvertQuoteToJobModal from '../../components/Quotes/QuotesModals/ConvertQuoteToJobModal';
import DuplicateQuoteModal from '../../components/Quotes/QuotesModals/DuplicateQuoteModal';

const mockSendQuoteApi = async (data: {
  recipientEmail: string;
  subject: string;
  message: string;
  attachPdf: boolean;
  quoteId: string;
}) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) {
        // Simulate 90% success rate
        console.log('Sending quote:', data);
        resolve();
      } else {
        reject(new Error('Network error or server issue'));
      }
    }, 1500); // Simulate API call delay
  });
};

const QuoteDetails = () => {
  const { user } = useAuth();
  const { quoteId } = useParams();
  const navigate = useNavigate();

  const [isShowMoreDropdownOpen, setIsShowMoreDropdownOpen] = useState(false);
  const [isAddInternalNoteOpen, setIsAddInternalNoteOpen] = useState(false);
  const [isAddCustomerNoteOpen, setIsAddCustomerNoteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isArchiveQuote, setIsArchiveQuote] = useState(false);
  const [isDeleteQuote, setIsDeleteQuote] = useState(false);
  const [isDuplicateQuoteModalOpen, setIsDuplicateQuoteModalOpen] =
    useState(false);
  const [isConvertQuoteModalOpen, setIsConvertQuoteModalOpen] = useState(false);

  const [internalNote, setInternalNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [quote, setQuote] = useState<TQuote | null>(null);

  const handleNewAttachmentAdded = (newAttachment: TQuoteAttachment) => {
    setQuote((prev) => ({
      ...prev!,
      attachments: [...(prev?.attachments || []), newAttachment],
    }));
  };

  const fetchQuote = async () => {
    if (!quoteId) return;
    const response = await GetQuoteById(quoteId);
    if (response.status === 200) {
      setQuote(response.data);
    }
  };

  const handleAddNote = async (noteType: string) => {
    if (!user || !quote?.customer) return;
    let updatedNote: TAddNote = {
      createdBy: user.id,
      createdByName: user.fullName,
      noteText: '',
    };
    if (noteType === 'internal') {
      updatedNote = {
        ...updatedNote,
        noteText: internalNote,
      };
      const response = await AddQuoteInternalNote(quote.id, updatedNote);
      if (response.status === 200) {
        setQuote((prev) => {
          if (!prev) return null;

          const newInternalNote: TNote = response.data;

          return {
            ...prev,
            internalNotes: [...(prev.internalNotes || []), newInternalNote],
          };
        });
        setIsAddInternalNoteOpen(false);
        setInternalNote('');
      }
    } else {
      updatedNote = {
        ...updatedNote,
        noteText: customerNote,
      };
      const response = await AddQuoteCustomerNote(quote.id, updatedNote);
      if (response.status === 200) {
        setQuote((prev) => {
          if (!prev) return null;

          const newCustomerNote: TNote = response.data;

          return {
            ...prev,
            customerNotes: [...(prev.customerNotes || []), newCustomerNote],
          };
        });
        setIsAddCustomerNoteOpen(false);
        setCustomerNote('');
      }
    }
  };

  const handleDeleteQuote = async () => {
    const response = await DeleteQuote(quoteId as string);
    if (response.status === 204) {
      navigate('/quotes');
    }
  };

  const handleArchiveQuote = async () => {
    await ArchiveQuote(quoteId as string);
  };

  const handleChangeQuoteStatus = async (status: QuoteStatus) => {
    const response = await ChangeQuoteStatus(quoteId as string, status);
    if (response.status === 200) {
      const { status, activityHistory } = response.data;
      setQuote((prev) => {
        if (!prev) return null;
        return { ...prev, status, activityHistory };
      });
    }
  };

  const handleSendQuote = async (data: {
    recipientEmail: string;
    subject: string;
    message: string;
    attachPdf: boolean;
    quoteId: string;
  }) => {
    // In a real application, you would call your actual API here
    // e.g., const response = await yourApi.sendQuote(data);
    // Handle success/failure based on response
    console.log('Attempting to send quote with data:', data);
    await mockSendQuoteApi(data); // Using mock API for demonstration
  };

  const handleDownloadQuotePdf = async () => {
    if (!quoteId) return;
    const response = await GetQuotePdf(quoteId);
    console.log(response);

    if (response.status === 200) {
      downloadPdfFile(response.data, `Quote-${quote?.quoteNumber}`);
    }
  };

  const handlePrintQuotePdf = async () => {
    if (!quoteId) {
      console.warn('No quote ID provided');
      return;
    }

    try {
      const response = await GetQuotePdf(quoteId);

      if (!response?.data || !(response.data instanceof Blob)) {
        throw new Error('Invalid PDF response received');
      }

      openPdfAndPrint(response.data);
    } catch (error) {
      console.error('Error preparing PDF for printing:', error);
      alert('Failed to open PDF for printing. Please try again.');
    }
  };

  const mockQuote = {
    customer: {
      name: 'John Smith',
    },
    paymentTerms: 'Net 30',
    customerMessage:
      'Thank you for the detailed quote. I will review it with my partner and get back to you soon.',
  };

  const showMoreRef = useClickOutside<HTMLDivElement>(() =>
    setIsShowMoreDropdownOpen(false)
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  if (!quote) return <div>Loading</div>;

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />
        {/* Enhanced Header */}
        <div className='shadow-sm'>
          <div className='px-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between py-6'>
              <div className=''>
                <h1 className='text-2xl font-bold text-text-primary'>
                  {quote.title}
                </h1>
                <div className='flex items-center space-x-3'>
                  <p className='text-sm text-gray-500'>
                    Quote #{quote.quoteNumber}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getQuoteStatus(quote.status).color
                    } shadow-sm`}
                  >
                    {getQuoteStatus(quote.status).icon}
                    <span className=''>{QuoteStatus[quote.status]}</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 relative'>
                <IconButton
                  icon={<Send className='w-4 h-4 mr-2' />}
                  customStyle='py-2 px-4 bg-bg-primary border-none text-white hover:bg-bg-primary-hover'
                  onClick={() => setIsSendModalOpen(true)}
                >
                  Send
                </IconButton>
                <IconButton
                  icon={<Edit3 className='w-4 h-4 mr-2' />}
                  customStyle='py-2 px-4 hover:border-gray-300'
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit
                </IconButton>

                <div className='relative'>
                  <IconButton
                    icon={<MoreVertical className='w-4 h-4 mr-2' />}
                    customStyle='py-2 px-4 hover:border-gray-300'
                    onClick={() =>
                      setIsShowMoreDropdownOpen(!isShowMoreDropdownOpen)
                    }
                  >
                    More
                  </IconButton>

                  {isShowMoreDropdownOpen && (
                    <motion.div
                      ref={showMoreRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg border border-gray-200 z-10'
                    >
                      <div className='py-1'>
                        {/* View/Print group */}
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          View
                        </div>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          Preview
                        </a>
                        <button
                          onClick={() => setIsDuplicateQuoteModalOpen(true)}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <CopyIcon className='w-4 h-4 mr-2' />
                          Duplicate
                        </button>
                        <button
                          onClick={() => setIsConvertQuoteModalOpen(true)}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <HardHat className='w-4 h-4 mr-2' />
                          Convert to Job
                        </button>

                        {/* Status group */}
                        <div className='border-t border-gray-100 my-1'></div>
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Status
                        </div>
                        <button
                          onClick={() =>
                            handleChangeQuoteStatus(QuoteStatus.Sent)
                          }
                          className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Send className='w-4 h-4 mr-2' />
                          Mark as Sent
                        </button>
                        <button
                          onClick={() =>
                            handleChangeQuoteStatus(QuoteStatus.Approved)
                          }
                          className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Check className='w-4 h-4 mr-2' />
                          Mark as Accepted
                        </button>
                        <button
                          onClick={() =>
                            handleChangeQuoteStatus(QuoteStatus.Declined)
                          }
                          className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <X className='w-4 h-4 mr-2' />
                          Mark as Rejected
                        </button>

                        {/* Actions group */}
                        <div className='border-t border-gray-100 my-1'></div>
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Actions
                        </div>

                        <button
                          onClick={handlePrintQuotePdf}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Printer className='w-4 h-4 mr-2' />
                          Print
                        </button>
                        <button
                          onClick={handleDownloadQuotePdf}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Download className='w-4 h-4 mr-2' />
                          Download
                        </button>
                        <button
                          onClick={() => setIsArchiveQuote(true)}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Archive className='w-4 h-4 mr-2' />
                          Archive
                        </button>
                        <button
                          onClick={() => setIsDeleteQuote(true)}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                        >
                          <Trash2 className='w-4 h-4 mr-2 text-red-600' />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='w-full flex gap-6'
          >
            {/* Main Content */}
            <div className='w-3/4 space-y-6'>
              {/* Line Items */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left w-1/2'>
                          Item
                        </th>
                        <th className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-1/6'>
                          Qty
                        </th>
                        <th className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-1/6'>
                          Unit Price
                        </th>
                        <th className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-1/6'>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {quote.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className='px-6 py-4 w-1/2'>
                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>
                                {item.name}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {item.description}
                              </p>
                            </div>
                          </td>
                          <td className='px-6 py-4 text-right text-sm text-gray-900 w-1/6'>
                            {item.quantity}
                          </td>
                          <td className='px-6 py-4 text-right text-sm text-gray-900 w-1/6'>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className='px-6 py-4 text-right text-sm font-medium text-gray-900 w-1/6'>
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pricing Summary */}
                <div className='bg-gray-50 p-6 border-t border-gray-200'>
                  <div className='flex justify-end'>
                    <div className='w-2/5 space-y-2'>
                      {[
                        {
                          label: 'Subtotal:',
                          value: `${formatCurrency(quote?.subtotal)}`,
                          color: 'text-gray-900',
                        },
                        quote.discountValue > 0 && {
                          label: `Discount (${quote?.discountValue}${
                            quote?.discountType === 0 ? '%' : '$'
                          }):`,
                          value: `-${formatCurrency(quote?.discount)}`,
                          color: 'text-green-600',
                        },
                        {
                          label: `Tax (${quote?.taxRate * 100}%):`,
                          value: `${formatCurrency(quote?.taxAmount)}`,
                          color: 'text-gray-900',
                        },
                        {
                          label: 'Total:',
                          value: `${formatCurrency(quote?.total)}`,
                          color: 'text-text-primary',
                          isTotal: true,
                          customColor: 'text-text-primary',
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className='bg-white rounded-xl shadow border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-xl font-semibold text-gray-800'>
                    Activity History
                  </h3>
                </div>

                <div className='space-y-6'>
                  {quote.activityHistory?.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                      No recent activity.
                    </p>
                  ) : (
                    quote.activityHistory?.map((activity, index) => {
                      const style = getQuoteActivityStyle(
                        QuoteActivityType[activity.type]
                      );
                      const IconComponent = style.icon;
                      const localDate = DateTime.fromISO(activity.changedAt, {
                        zone: 'utc',
                      }).toLocal();
                      const formattedActivityDate = localDate.toFormat(
                        'MMM dd, yyyy • h:mm a'
                      );

                      return (
                        <div
                          key={activity.id}
                          className='flex items-start space-x-4 relative'
                        >
                          {/* Timeline line */}
                          {index !==
                            (quote.activityHistory?.length || 0) - 1 && ( // Added null check
                            <div className='absolute left-5 top-10 w-0.5 h-8 bg-gray-200'></div>
                          )}

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full ${style.lightBg} flex items-center justify-center shadow-sm`}
                          >
                            <IconComponent
                              className={`w-4 h-4 ${style.textColor}`}
                            />
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2'>
                                <p className='text-sm text-gray-500'>
                                  {formattedActivityDate}
                                </p>
                              </div>
                            </div>

                            <div className='mt-1'>
                              <p className='text-sm text-gray-800'>
                                <span className='font-medium text-gray-900'>
                                  {activity.changedByName}
                                </span>{' '}
                                {activity.action}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Show more button */}
                {(quote.activityHistory?.length || 0) > 5 && ( // Added null check
                  <div className='mt-6 text-center'>
                    <button className='cursor-pointer text-sm text-blue-600 hover:text-blue-800'>
                      Show all activities
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className='w-1/4 space-y-6'>
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
                        {quote?.customer?.fullName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {quote?.customer?.companyName}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center text-sm text-gray-600'>
                      <Phone className='w-4 h-4 mr-3 text-gray-400' />
                      {quote?.customer?.customerPhones?.[0]?.phoneNumber}
                    </div>
                    <div className='flex items-center text-sm text-gray-600'>
                      <Mail className='w-4 h-4 mr-3 text-gray-400' />
                      {quote?.customer?.emails?.[0]}
                    </div>
                    <div className='flex items-start'>
                      <MapPin className='w-5 h-5 text-gray-400 mt-0.5 mr-2.5' />
                      <div>
                        <p className='text-xs text-gray-500'>
                          Service location
                        </p>
                        <p className='text-sm font-medium text-gray-900'>
                          {quote?.property?.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Quote Details Section */}
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Quote Details
                </h3>
                <div className='space-y-3 text-sm'>
                  {quote.createdAt && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Created</span>
                      <span className='text-gray-900'>
                        {DateTime.fromISO(quote.createdAt, { zone: 'utc' })
                          .toLocal()
                          .toFormat('MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {quote.expiresAt && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Expires</span>
                      <span className='text-gray-900'>
                        {DateTime.fromISO(quote.expiresAt, { zone: 'utc' })
                          .toLocal()
                          .toFormat('MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {quote.assignedToUser && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Assigned To</span>
                      <span className='text-gray-900'>
                        {quote.assignedToUser.fullName}
                      </span>
                    </div>
                  )}

                  {quote.source && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Source</span>
                      <span className='text-gray-900'>{quote.source}</span>
                    </div>
                  )}

                  {quote.jobId && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Converted to Job</span>
                      <a
                        href={`/jobs/${quote.jobId}`}
                        className='text-blue-600 hover:underline font-medium'
                      >
                        View Job #{quote.jobId}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Internal Notes
                  </h3>
                  {!isAddInternalNoteOpen && (
                    <IconButton
                      icon={<Plus className='w-4 h-4 mr-1' />}
                      onClick={() => setIsAddInternalNoteOpen(true)}
                      customStyle='bg-bg-primary text-white hover:border-gray-300 border-none'
                    >
                      Add
                    </IconButton>
                  )}
                </div>
                {isAddInternalNoteOpen && (
                  <div className='mb-6 flex flex-col items-end space-y-2'>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder='Add new note...'
                      rows={3}
                      className='w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bg-primary focus:border-transparent text-gray-800 resize-y'
                    />
                    <div className='flex space-x-2'>
                      <CustomButton
                        onClick={() => setIsAddInternalNoteOpen(false)}
                        customStyle='py-1.5 px-3.5 hover:bg-gray-50'
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleAddNote('internal')}
                        customStyle='py-1.5 px-3.5 bg-bg-primary text-white hover:bg-bg-primary-hover border-none'
                      >
                        Save
                      </CustomButton>
                    </div>
                  </div>
                )}
                <div className='space-y-6'>
                  {quote.internalNotes.length === 0 ? (
                    <div className='text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200'>
                      <p className='text-gray-500 text-sm'>
                        No internal notes added yet.
                      </p>
                    </div>
                  ) : (
                    quote.internalNotes.map((note) => (
                      <QuoteNote key={note.id} note={note} />
                    ))
                  )}
                </div>
              </div>

              {/* Customer Notes */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Customer Notes
                  </h3>
                  {!isAddCustomerNoteOpen && (
                    <IconButton
                      icon={<Plus className='w-4 h-4 mr-1' />}
                      onClick={() => setIsAddCustomerNoteOpen(true)}
                      customStyle='bg-bg-primary text-white hover:border-gray-300 border-none'
                    >
                      Add
                    </IconButton>
                  )}
                </div>
                {isAddCustomerNoteOpen && (
                  <div className='mb-6 flex flex-col items-end space-y-2'>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder='Add new note...'
                      rows={3}
                      className='w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bg-primary focus:border-transparent text-gray-800 resize-y'
                    />
                    <div className='flex space-x-2'>
                      <CustomButton
                        onClick={() => setIsAddCustomerNoteOpen(false)}
                        customStyle='py-1.5 px-3.5 hover:bg-gray-50'
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleAddNote('customer')}
                        customStyle='py-1.5 px-3.5 bg-bg-primary text-white hover:bg-bg-primary-hover border-none'
                      >
                        Save
                      </CustomButton>
                    </div>
                  </div>
                )}
                <div className='space-y-4'>
                  {quote.customerNotes.length === 0 ? (
                    <div className='text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200'>
                      <p className='text-gray-500 text-sm'>
                        No customer notes added yet.
                      </p>
                    </div>
                  ) : (
                    quote.customerNotes.map((note) => (
                      <QuoteNote key={note.id} note={note} /> // Assuming notes have a unique 'id'
                    ))
                  )}
                </div>

                {mockQuote.customerMessage && (
                  <div className='mt-6 pt-6 border-t border-gray-200'>
                    <h4 className='text-sm font-medium text-gray-900 mb-3'>
                      Customer Message
                    </h4>
                    <div className='flex items-start space-x-3'>
                      <div className='flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-medium'>
                        {mockQuote.customer.name.charAt(0)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm text-gray-700'>
                          {mockQuote.customerMessage}
                        </p>
                        <div className='flex items-center space-x-2 text-xs text-gray-500 mt-1'>
                          <span>{mockQuote.customer.name}</span>
                          <span>•</span>
                          <span>{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <QuoteAttachments
                quoteId={quote.id}
                currentAttachments={quote.attachments || []}
                onAttachmentsUpdated={handleNewAttachmentAdded}
              />
            </div>
          </motion.div>
        </div>
      </div>
      <ActionConfirmationModal
        isOpen={isArchiveQuote}
        onClose={() => setIsArchiveQuote(false)}
        onConfirm={handleArchiveQuote}
        itemName={quote.title || 'Quote'}
        actionType='archive'
        itemType='quote'
      />
      <ActionConfirmationModal
        isOpen={isDeleteQuote}
        onClose={() => setIsDeleteQuote(false)}
        onConfirm={handleDeleteQuote}
        itemName={quote.title || 'Quote'}
        actionType='delete'
        itemType='quote'
      />
      {isSendModalOpen && (
        <SendQuoteModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          onSend={handleSendQuote}
          customer={quote.customer}
          quote={quote}
          user={user}
        />
      )}
      <EditQuoteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        quoteToEdit={quote}
        setQuotes={setQuote}
      />
      <ConvertQuoteToJobModal
        isOpen={isConvertQuoteModalOpen}
        onClose={() => setIsConvertQuoteModalOpen(false)}
        quote={quote}
      />
      <DuplicateQuoteModal
        isOpen={isDuplicateQuoteModalOpen}
        onClose={() => setIsDuplicateQuoteModalOpen(false)}
        quoteToDuplicate={quote}
      />
    </div>
  );
};

export default QuoteDetails;
