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
  FileDown,
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
import { TQuote } from '../../types/Quote';
import { useParams } from 'react-router';
import { GetQuoteById } from '../../services/Quote';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';

const QuoteDetails = () => {
  const { quoteId } = useParams();

  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [quote, setQuote] = useState<TQuote>();

  const fetchQuote = async () => {
    if (!quoteId) return;
    const response = await GetQuoteById(quoteId);
    if (response.status === 200) {
      setQuote(response.data);
    }
  };

  // Sample quote data
  const mockQuote = {
    id: 'QT-2024-001',
    quoteNumber: 'Q-001',
    status: 'Sent',
    title: 'HVAC System Replacement',
    creationDate: '2024-01-15',
    lastUpdated: '2024-01-18',
    expirationDate: '2024-02-15',
    customer: {
      id: 'CUST-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Springfield, IL 62701',
    },
    serviceLocation: '123 Main St, Springfield, IL 62701',
    lineItems: [
      {
        id: 1,
        type: 'Service',
        name: 'HVAC System Installation',
        description:
          'Complete installation of new 3-ton central air conditioning system',
        quantity: 1,
        unitPrice: 4500.0,
        total: 4500.0,
        taxable: true,
        optional: false,
      },
      {
        id: 2,
        type: 'Material',
        name: 'Thermostat Upgrade',
        description: 'Smart programmable thermostat with WiFi connectivity',
        quantity: 1,
        unitPrice: 250.0,
        total: 250.0,
        taxable: true,
        optional: true,
      },
      {
        id: 3,
        type: 'Labor',
        name: 'Installation Labor',
        description: 'Professional installation and setup (8 hours)',
        quantity: 8,
        unitPrice: 85.0,
        total: 680.0,
        taxable: false,
        optional: false,
      },
    ],
    pricing: {
      subtotal: 5430.0,
      discount: {
        type: 'Percentage',
        value: 5,
        amount: 271.5,
        reason: 'First-time customer discount',
      },
      tax: {
        rate: 8.25,
        amount: 425.54,
      },
      total: 5584.04,
      deposit: {
        type: 'Percentage',
        value: 25,
        amount: 1396.01,
        dueDate: '2024-01-25',
      },
    },
    paymentTerms: 'Net 30',
    assignedTo: 'Mike Johnson',
    internalNotes: [
      {
        id: '10d3e07e-f530-4b28-8ad4-4e77745d6801',
        createdBy: 'a231d3fb-d34f-4766-af37-f56ac81d54ba',
        createdByName: 'Mike Johnson',
        noteText:
          'Customer prefers morning installation. Check access to basement.',
        pathFile: '',
        customerId: '8afebb73-aa45-40ab-880f-6b662711c3c2',
        createdAt: '2025-06-30T22:52:28.24417',
        updatedAt: '2025-06-30T22:52:28.24417',
      },
      {
        id: '10d3e07e-f530-4b28-8ad4-4e77745d6801',
        createdBy: 'a231d3fb-d34f-4766-af37-f56ac81d54ba',
        createdByName: 'Sarah Williams',
        noteText: 'Confirmed availability for installation date.',
        pathFile: '',
        customerId: '8afebb73-aa45-40ab-880f-6b662711c3c2',
        createdAt: '2025-06-30T22:52:28.24417',
        updatedAt: '2025-06-30T22:52:28.24417',
      },
    ],
    customerNotes: [
      {
        id: '10d3e07e-f530-4b28-8ad4-4e77745d6801',
        createdBy: 'a231d3fb-d34f-4766-af37-f56ac81d54ba',
        createdByName: 'John Smith',
        noteText:
          'Please confirm if the thermostat model is compatible with Google Home.',
        pathFile: '',
        customerId: '8afebb73-aa45-40ab-880f-6b662711c3c2',
        createdAt: '2025-06-30T22:52:28.24417',
        updatedAt: '2025-06-30T22:52:28.24417',
      },
    ],
    customerMessage:
      'Thank you for the detailed quote. I will review it with my partner and get back to you soon.',
    attachments: ['floor_plan.pdf', 'product_specs.pdf'],
  };

  const getActivityStyle = (activityType) => {
    const styles = {
      quote_created: {
        icon: FileText,
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-500',
        lightBg: 'bg-blue-50',
      },
      quote_edited: {
        icon: Edit3,
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-500',
        lightBg: 'bg-orange-50',
      },
      quote_sent: {
        icon: Send,
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        lightBg: 'bg-green-50',
      },
      internal_note_added: {
        icon: MessageSquare,
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-500',
        lightBg: 'bg-purple-50',
      },
      customer_note_added: {
        icon: MessageSquare,
        bgColor: 'bg-indigo-500',
        textColor: 'text-indigo-500',
        lightBg: 'bg-indigo-50',
      },
      customer_message: {
        icon: MessageSquare,
        bgColor: 'bg-cyan-500',
        textColor: 'text-cyan-500',
        lightBg: 'bg-cyan-50',
      },
      attachment_added: {
        icon: Paperclip,
        bgColor: 'bg-gray-500',
        textColor: 'text-gray-500',
        lightBg: 'bg-gray-50',
      },
      status_changed: {
        icon: Settings,
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        lightBg: 'bg-yellow-50',
      },
      marked_sent: {
        icon: CheckCircle,
        bgColor: 'bg-green-500',
        textColor: 'text-green-500',
        lightBg: 'bg-green-50',
      },
      marked_accepted: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        lightBg: 'bg-emerald-50',
      },
      marked_rejected: {
        icon: XCircle,
        bgColor: 'bg-red-500',
        textColor: 'text-red-500',
        lightBg: 'bg-red-50',
      },
      converted_to_job: {
        icon: Briefcase,
        bgColor: 'bg-blue-600',
        textColor: 'text-blue-600',
        lightBg: 'bg-blue-50',
      },
      default: {
        icon: Clock,
        bgColor: 'bg-gray-400',
        textColor: 'text-gray-400',
        lightBg: 'bg-gray-50',
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
  ];

  let activityFeed = [];

  const displayActivities =
    activityFeed.length > 0 ? activityFeed : sampleActivities;
  const showMoreRef = useClickOutside<HTMLDivElement>(() =>
    setShowMoreDropdown(false)
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
                  {mockQuote.title}
                </h1>
                <div className='flex items-center space-x-3'>
                  <p className='text-sm text-gray-500'>
                    Quote #{mockQuote.quoteNumber}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getQuoteStatus(0).color
                    } shadow-sm`}
                  >
                    {getQuoteStatus(0).icon}
                    <span className=''>{mockQuote.status}</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 relative'>
                <IconButton
                  icon={<Send className='w-4 h-4 mr-2' />}
                  customStyle='py-2 px-4 bg-bg-primary text-white hover:border-gray-300 hover:bg-bg-primary-hover'
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
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  >
                    More
                  </IconButton>

                  {showMoreDropdown && (
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
                        {
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
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`flex justify-between ${
                            item.isTotal ? 'pt-2 border-t border-gray-200' : ''
                          }`}
                        >
                          <span
                            className={`${
                              item.isTotal
                                ? 'font-semibold text-primary'
                                : 'text-gray-600'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span
                            className={`${
                              item.isTotal ? 'font-semibold' : 'font-medium'
                            } ${item.color}`}
                            style={
                              item.customColor
                                ? { color: item.customColor }
                                : {}
                            }
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
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
                  <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                    View All
                  </button>
                </div>

                <div className='space-y-6'>
                  {displayActivities.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                      No recent activity.
                    </p>
                  ) : (
                    displayActivities.map((activity, index) => {
                      const style = getActivityStyle(activity.type);
                      const IconComponent = style.icon;

                      return (
                        <div
                          key={activity.id}
                          className='flex items-start space-x-4 relative'
                        >
                          {/* Timeline line */}
                          {index !== displayActivities.length - 1 && (
                            <div className='absolute left-5 top-10 w-0.5 h-8 bg-gray-200'></div>
                          )}

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center shadow-sm`}
                          >
                            <IconComponent className='w-4 h-4 text-white' />
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2'>
                                <time className='text-sm text-gray-600'>
                                  {new Date(
                                    activity.changedAt
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </time>
                                <div>-</div>
                                <time className='text-sm text-gray-600'>
                                  {new Date(
                                    activity.changedAt
                                  ).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })}
                                </time>
                                {activity.isScheduled && (
                                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                    <Calendar className='w-3 h-3 mr-1' />
                                    Scheduled
                                  </span>
                                )}
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

                          {/* Additional action button (like "View Cameras" in your image) */}
                          {(activity.type === 'quote_sent' ||
                            activity.type === 'customer_message') && (
                            <div className='flex-shrink-0'>
                              <button className='inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50'>
                                <User className='w-3 h-3 mr-1' />
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Show more button */}
                {displayActivities.length > 5 && (
                  <div className='mt-6 text-center'>
                    <button className='inline-flex items-center text-sm text-blue-600 hover:text-blue-800'>
                      <Clock className='w-4 h-4 mr-1' />
                      Show 3 more activities
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className='space-y-6'>
              {/* Customer Information */}
              {/* <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Customer Information
                </h3>
                <div className='space-y-4'>
                  {[
                    {
                      icon: <User className='w-5 h-5 text-gray-400' />,
                      primary: quote?.customer?.fullName,
                    },
                    {
                      icon: <Mail className='w-5 h-5 text-gray-400' />,
                      primary: quote?.customer?.emails?.[0],
                    },
                    {
                      icon: <Phone className='w-5 h-5 text-gray-400' />,
                      primary:
                        quote?.customer?.customerPhones?.[0]?.phoneNumber,
                    },
                    {
                      icon: <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />,
                      primary: quote?.customer?.properties?.[0]?.address,
                      secondary: 'Service Location',
                    },
                  ].map((item, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      {item.icon}
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {item.primary}
                        </p>
                        {item.secondary && (
                          <p className='text-xs text-gray-500'>
                            {item.secondary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
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
                      {quote?.customer?.customerPhones?.[0].phoneNumber}
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
                          {quote?.customer?.properties?.[0]?.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Internal Notes
                  </h3>
                  <IconButton
                    icon={<Plus className='w-4 h-4 mr-1' />}
                    onClick={() => {}}
                    customStyle='bg-bg-primary text-white hover:border-gray-300'
                  >
                    Add
                  </IconButton>
                </div>
                <div className='space-y-6'>
                  {mockQuote.internalNotes.map((note) => (
                    <QuoteNote note={note} />
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Customer Notes
                  </h3>
                  <IconButton
                    icon={<Plus className='w-4 h-4 mr-1' />}
                    onClick={() => {}}
                    customStyle='bg-bg-primary text-white hover:border-gray-300'
                  >
                    Add
                  </IconButton>
                </div>
                <div className='space-y-4'>
                  {mockQuote.customerNotes.map((note) => (
                    <QuoteNote note={note} />
                  ))}
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
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Attachments
                  </h3>
                  <IconButton
                    icon={<Plus className='w-4 h-4 mr-1' />}
                    onClick={() => {}}
                    customStyle='bg-bg-primary text-white hover:border-gray-300'
                  >
                    Add
                  </IconButton>
                </div>
                <div className='space-y-2'>
                  {mockQuote.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100'
                    >
                      <div className='flex items-center space-x-3'>
                        <FileDown className='w-5 h-5 text-gray-400' />
                        <span className='text-sm font-medium text-gray-900'>
                          {attachment}
                        </span>
                      </div>
                      <button className='hover:opacity-80 cursor-pointer'>
                        <Download className='w-4 h-4 text-primary' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetails;
