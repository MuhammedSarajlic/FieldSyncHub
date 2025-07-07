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
  MessageSquare,
  Archive,
  Printer,
  Check,
  X,
  CopyIcon,
  Eye,
  HardHat,
  MoreVertical,
  Paperclip,
  Settings,
  CheckCircle,
  XCircle,
  Briefcase,
  Clock,
  Calendar,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import { useClickOutside } from '../../hooks/useClickOutside';
import IconButton from '../../components/CustomElements/Buttons/IconButton';
import { getQuoteStatus } from '../../utils/FuntionHelpers/getQuoteStatus';
import QuoteNote from '../../components/Quotes/QuoteNotes/QuoteNote';
import {
  TAddQuoteAttachment,
  TQuote,
  TQuoteAttachment,
} from '../../types/Quote';
import { useParams } from 'react-router';
import {
  AddQuoteCustomerNote,
  AddQuoteInternalNote,
  GetQuoteById,
} from '../../services/Quote';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import CustomButton from '../../components/CustomElements/Buttons/CustomButton';
import { TAddNote } from '../../types/Note';
import { useAuth } from '../../context/AuthProvider';
import { DateTime } from 'luxon';
import QuoteAttachments from '../../components/Quotes/QuoteAttachments/QuoteAttachments';

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const { user } = useAuth();

  const [isShowMoreDropdownOpen, setIsShowMoreDropdownOpen] = useState(false);
  const [isAddInternalNoteOpen, setIsAddInternalNoteOpen] = useState(false);
  const [isAddCustomerNoteOpen, setIsAddCustomerNoteOpen] = useState(false);
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
        setQuote((prev) => ({
          ...prev,
          internalNotes: [...(prev?.internalNotes || []), response.data],
        }));
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
        setQuote((prev) => ({
          ...prev,
          customerNotes: [...(prev?.customerNotes || []), response.data],
        }));
        setIsAddCustomerNoteOpen(false);
        setCustomerNote('');
      }
    }
  };

  // Sample quote data (Keep this for mock purposes if live data is not available)
  const mockQuote = {
    customer: {
      name: 'John Smith',
    },
    paymentTerms: 'Net 30',
    assignedTo: 'Mike Johnson', // Example assignedTo
    customerMessage:
      'Thank you for the detailed quote. I will review it with my partner and get back to you soon.',
    attachments: ['floor_plan.pdf', 'product_specs.pdf'],
  };

  const getActivityStyle = (activityType: string) => {
    // Added type for activityType
    const styles: {
      [key: string]: {
        icon: any;
        bgColor: string;
        textColor: string;
        lightBg: string;
      };
    } = {
      // Added type definition for styles
      quote_created: {
        icon: FileText,
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-500',
        lightBg: 'bg-blue-100',
      },
      quote_edited: {
        icon: Edit3,
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-500',
        lightBg: 'bg-orange-100',
      },
      quote_sent: {
        icon: Send,
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        lightBg: 'bg-green-100',
      },
      internal_note_added: {
        icon: MessageSquare,
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-500',
        lightBg: 'bg-purple-100',
      },
      customer_note_added: {
        icon: MessageSquare,
        bgColor: 'bg-indigo-500',
        textColor: 'text-indigo-500',
        lightBg: 'bg-indigo-100',
      },
      customer_message: {
        icon: MessageSquare,
        bgColor: 'bg-cyan-500',
        textColor: 'text-cyan-500',
        lightBg: 'bg-cyan-100',
      },
      attachment_added: {
        icon: Paperclip,
        bgColor: 'bg-gray-500',
        textColor: 'text-gray-500',
        lightBg: 'bg-gray-100',
      },
      status_changed: {
        icon: Settings,
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        lightBg: 'bg-yellow-100',
      },
      marked_sent: {
        icon: Send,
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        lightBg: 'bg-green-100',
      },
      marked_accepted: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        lightBg: 'bg-emerald-100',
      },
      marked_rejected: {
        icon: XCircle,
        bgColor: 'bg-red-500',
        textColor: 'text-red-500',
        lightBg: 'bg-red-100',
      },
      converted_to_job: {
        icon: Briefcase,
        bgColor: 'bg-blue-600',
        textColor: 'text-blue-600',
        lightBg: 'bg-blue-100',
      },
      default: {
        icon: Clock,
        bgColor: 'bg-gray-400',
        textColor: 'text-gray-400',
        lightBg: 'bg-gray-100',
      },
    };

    return styles[activityType] || styles.default;
  };

  // Activity feed mock data
  const sampleActivities = [
    {
      id: 1,
      type: 'quote_created',
      action: 'created quote #Q-2024-001',
      changedByName: 'John Smith',
      changedAt: new Date().toISOString(),
      isScheduled: false,
    },
    {
      id: 2,
      type: 'quote_edited',
      action: 'edited quote details',
      changedByName: 'Sarah Johnson',
      changedAt: new Date(Date.now() - 3600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 3,
      type: 'internal_note_added',
      action: 'added internal note',
      changedByName: 'Mike Wilson',
      changedAt: new Date(Date.now() - 7200000).toISOString(),
      isScheduled: false,
    },
    {
      id: 4,
      type: 'quote_sent',
      action: 'sent quote to customer',
      changedByName: 'Emily Davis',
      changedAt: new Date(Date.now() - 10800000).toISOString(),
      isScheduled: true,
    },
    {
      id: 5,
      type: 'customer_message',
      action: 'sent a message',
      changedByName: 'Customer Portal',
      changedAt: new Date(Date.now() - 14400000).toISOString(),
      isScheduled: false,
    },
    {
      id: 6,
      type: 'attachment_added',
      action: 'added attachment: blueprint.pdf',
      changedByName: 'Tom Brown',
      changedAt: new Date(Date.now() - 18000000).toISOString(),
      isScheduled: false,
    },
    {
      id: 7,
      type: 'marked_accepted',
      action: 'marked quote as accepted',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 8,
      type: 'customer_note_added',
      action: 'added customer note',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 9,
      type: 'marked_sent',
      action: 'marked quote as sent',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 10,
      type: 'marked_rejected',
      action: 'marked quote as rejected',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 11,
      type: 'converted_to_job',
      action: 'converted quote to job',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 12,
      type: 'status_changed',
      action: 'status changed to ...',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
    {
      id: 13,
      type: 'status_changed123',
      action: 'status changed to ...',
      changedByName: 'Lisa Anderson',
      changedAt: new Date(Date.now() - 21600000).toISOString(),
      isScheduled: false,
    },
  ];

  let activityFeed: any[] = []; // Explicitly type activityFeed

  const displayActivities =
    activityFeed.length > 0 ? activityFeed : sampleActivities;
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
  }, []);

  if (!quote) return <div>Loading</div>;

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />
        {/* Enhanced Header */}
        <div className='shadow-sm'>
          <div className='px-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4'>
              <div className=''>
                <h1 className='text-2xl font-bold text-primary'>
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
                  customStyle='py-2 px-4 bg-bg-primary border-none text-white hover:border-gray-300 hover:bg-bg-primary-hover'
                  onClick={() => {}}
                >
                  Send
                </IconButton>
                <IconButton
                  icon={<Edit3 className='w-4 h-4 mr-2' />}
                  customStyle='py-2 px-4 hover:border-gray-300'
                  onClick={() => {}}
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
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Printer className='w-4 h-4 mr-2' />
                          Print
                        </a>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Download className='w-4 h-4 mr-2' />
                          Download
                        </a>

                        {/* Status group */}
                        <div className='border-t border-gray-100 my-1'></div>
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Status
                        </div>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Send className='w-4 h-4 mr-2' />
                          Mark as Sent
                        </a>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Check className='w-4 h-4 mr-2' />
                          Mark as Accepted
                        </a>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <X className='w-4 h-4 mr-2' />
                          Mark as Rejected
                        </a>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <HardHat className='w-4 h-4 mr-2' />
                          Convert to Job
                        </a>

                        {/* Actions group */}
                        <div className='border-t border-gray-100 my-1'></div>
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Actions
                        </div>
                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <CopyIcon className='w-4 h-4 mr-2' />
                          Duplicate
                        </a>

                        <a
                          href='#'
                          className='flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                        >
                          <Archive className='w-4 h-4 mr-2 text-red-600' />
                          Archive
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='px-6 py-8'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='grid grid-cols-1 lg:grid-cols-3 gap-6'
          >
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Line Items */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        {['Item', 'Qty', 'Unit Price', 'Total', 'Status'].map(
                          (header) => (
                            <th
                              key={header}
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                            >
                              {header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {quote?.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className='px-6 py-4'>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>
                                {item.name}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {item.description}
                              </p>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {item.quantity}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {formatCurrency(item.totalPrice)}
                          </td>
                          {/* <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.optional
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.optional ? 'Optional' : 'Required'}
                            </span>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pricing Summary */}
                <div className='bg-gray-50 p-6 border-t border-gray-200'>
                  <div className='flex justify-end'>
                    <div className='w-64 space-y-2'>
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
                          color: 'text-bg-primary',
                          isTotal: true,
                          customColor: '#356852',
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
                                    ? 'font-semibold text-primary'
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
                      const style = getActivityStyle(activity.type);
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
            <div className='space-y-6'>
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
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Quote Details
                </h3>
                <div className='space-y-3 text-sm text-gray-700'>
                  {/* Expires At */}
                  {quote.expiresAt && (
                    <div className='flex items-center'>
                      <Calendar className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Expires:{' '}
                        <span className='font-medium'>
                          {DateTime.fromISO(quote.expiresAt, { zone: 'utc' })
                            .toLocal()
                            .toFormat('MMM dd, yyyy')}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Assigned To */}
                  {mockQuote.assignedTo && ( // Assuming quote.assignedTo exists as a string
                    <div className='flex items-center'>
                      <User className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Assigned To:{' '}
                        <span className='font-medium'>
                          {mockQuote.assignedTo}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Source */}
                  {quote.source && ( // Assuming quote.source exists as a string
                    <div className='flex items-center'>
                      <FileText className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Source:{' '}
                        <span className='font-medium'>{quote.source}</span>
                      </p>
                    </div>
                  )}

                  {/* Link to Job (if converted) */}
                  {/* IMPORTANT: This assumes 'quote.jobId' exists when the quote is converted to a job.
                              You'll need to replace `/jobs/${quote.jobId}` with your actual job details route. */}
                  {quote.jobId && (
                    <div className='flex items-center'>
                      <Briefcase className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Converted to Job:{' '}
                        <a
                          href={`/jobs/${quote.jobId}`}
                          className='text-blue-600 hover:underline font-medium'
                        >
                          View Job #{quote.jobId}
                        </a>
                      </p>
                    </div>
                  )}

                  {/* Message if no details are available */}
                  {!quote.expiresAt &&
                    !quote.assignedTo &&
                    !quote.source &&
                    !quote.jobId && (
                      <p className='text-gray-500 text-center py-4'>
                        No additional quote details available.
                      </p>
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
                        customStyle='py-1.5 px-3.5'
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
                      <QuoteNote key={note.id} note={note} /> // Assuming notes have a unique 'id'
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
                        customStyle='py-1.5 px-3.5'
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
    </div>
  );
};

export default QuoteDetails;
