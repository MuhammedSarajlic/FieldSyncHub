import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Check,
  X,
  Send,
  Eye,
  ArrowRight,
  Edit,
  PlusCircle,
  Clock,
  Calendar,
  User,
  DollarSign,
  Paperclip,
  Trash,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin,
  Phone,
  Building,
  AlertCircle,
  Download,
  Copy,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { GetQuoteById } from '../../services/Quote';
import { useParams } from 'react-router';
import { TQuote } from '../../types/Quote';
import { QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { getQuoteStatus } from '../../utils/FuntionHelpers/getQuoteStatus';
import { DiscountType } from '../../constants/Enumeration/CommonEnum/DiscountEnum';
import CustomerEmailModal from '../../components/Customers/CustomerDetailsComponents.tsx/CustomerEmailModal';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState<TQuote>();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
  };

  const handleConvertToJob = () => {
    alert('Converting to job...');
  };

  const handleCopyQuoteNumber = () => {
    navigator.clipboard.writeText(quote?.quoteNumber || '');
    // You could add a toast notification here
  };

  const fetchCurrentQuote = async () => {
    const response = await GetQuoteById(quoteId as string);
    if (response.status === 200) {
      setQuote(response.data);
    }
  };

  useEffect(() => {
    fetchCurrentQuote();
  }, [quoteId]);

  if (!quote) {
    return (
      <div className='flex bg-gray-50 min-h-screen'>
        <Sidebar />
        <div className='flex-1 ml-64'>
          <Navbar />
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-500 text-sm'>Loading quote details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getQuoteStatus(quote.status);
  const isExpired = new Date(quote.expiresAt) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(quote.expiresAt).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />

        <div className='px-8 py-6 max-w-7xl mx-auto'>
          {/* Enhanced Header Section */}
          <div className='mb-8'>
            <div className='flex items-start justify-between mb-6'>
              <div className='flex items-center space-x-6'>
                <div className='relative'>
                  <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg'>
                    <FileText className='w-8 h-8' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-3'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                      Quote #{quote.quoteNumber}
                    </h1>
                    <button
                      onClick={handleCopyQuoteNumber}
                      className='p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
                      title='Copy quote number'
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      <span className='ml-1'>{QuoteStatus[quote.status]}</span>
                    </span>
                    {quote.viewed && (
                      <span className='inline-flex items-center text-gray-500 text-sm'>
                        <Eye size={14} className='mr-1' />
                        Viewed {formatDate(quote.viewedAt)}
                      </span>
                    )}
                    {isExpired && (
                      <span className='inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium'>
                        <AlertCircle size={12} className='mr-1' />
                        Expired
                      </span>
                    )}
                    {!isExpired && daysUntilExpiry <= 7 && (
                      <span className='inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium'>
                        <Clock size={12} className='mr-1' />
                        Expires in {daysUntilExpiry} days
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className='flex items-center space-x-3'>
                {quote.status === QuoteStatus.AwaitingApproval && (
                  <>
                    <button className='px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'>
                      <Check size={18} />
                      <span className='font-medium'>Approve</span>
                    </button>
                    <button className='px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'>
                      <X size={18} />
                      <span className='font-medium'>Decline</span>
                    </button>
                  </>
                )}
                {quote.status === QuoteStatus.Approved && (
                  <button
                    onClick={handleConvertToJob}
                    className='px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'
                  >
                    <ArrowRight size={18} />
                    <span className='font-medium'>Convert to Job</span>
                  </button>
                )}
                <CustomIconButton
                  icon={<Send size={16} className='mr-2' />}
                  text='Send quote'
                  customStyle='py-2.5 px-5 text-base'
                />
                {/* <button
                  onClick={handleSendEmail}
                  className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'
                >
                  <Send size={18} />
                  <span className='font-medium'>Send Quote</span>
                </button> */}
                {/* <button className='px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2'>
                  <Download size={18} />
                  <span className='font-medium'>Download</span>
                </button> */}
                <button
                  className={`px-5 py-2.5 cursor-pointer border-[1px] text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Edit size={16} />
                  <span className='font-medium'>Edit</span>
                </button>
                {/* More Actions Dropdown */}
                <div className='relative'>
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className='p-2.5 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {showActionsMenu && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
                      <div className='py-1'>
                        <button className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                          <Download size={16} className='mr-3' />
                          Download
                        </button>
                        <button className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                          <ExternalLink size={16} className='mr-3' />
                          View Public Link
                        </button>
                        <button className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                          <Copy size={16} className='mr-3' />
                          Duplicate Quote
                        </button>
                        <div className='border-t border-gray-100 my-1'></div>
                        <button className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50'>
                          <Trash size={16} className='mr-3' />
                          Delete Quote
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200'>
              <div className='flex items-start justify-between mb-4'>
                <div className='p-3 bg-blue-100 rounded-xl'>
                  <Calendar className='w-6 h-6 text-blue-600' />
                </div>
                <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                  Created
                </span>
              </div>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {formatDate(quote.createdAt)}
              </p>
              <p className='text-sm text-gray-500'>
                {Math.ceil(
                  (new Date().getTime() - new Date(quote.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days ago
              </p>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200'>
              <div className='flex items-start justify-between mb-4'>
                <div
                  className={`p-3 rounded-xl ${
                    isExpired
                      ? 'bg-red-100'
                      : daysUntilExpiry <= 7
                      ? 'bg-amber-100'
                      : 'bg-yellow-100'
                  }`}
                >
                  <Clock
                    className={`w-6 h-6 ${
                      isExpired
                        ? 'text-red-600'
                        : daysUntilExpiry <= 7
                        ? 'text-amber-600'
                        : 'text-yellow-600'
                    }`}
                  />
                </div>
                <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                  Expires
                </span>
              </div>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {formatDate(quote.expiresAt)}
              </p>
              <p
                className={`text-sm font-medium ${
                  isExpired
                    ? 'text-red-600'
                    : daysUntilExpiry <= 7
                    ? 'text-amber-600'
                    : 'text-gray-500'
                }`}
              >
                {isExpired ? 'Expired' : `${daysUntilExpiry} days remaining`}
              </p>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200'>
              <div className='flex items-start justify-between mb-4'>
                <div className='p-3 bg-green-100 rounded-xl'>
                  <User className='w-6 h-6 text-green-600' />
                </div>
                <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                  Created By
                </span>
              </div>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {quote.createdByUser?.fullName}
              </p>
              <p className='text-sm text-gray-500'>Team Member</p>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200'>
              <div className='flex items-start justify-between mb-4'>
                <div className='p-3 bg-purple-100 rounded-xl'>
                  <DollarSign className='w-6 h-6 text-purple-600' />
                </div>
                <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                  Total Value
                </span>
              </div>
              <p className='text-2xl font-bold mb-1'>
                {formatCurrency(quote.total)}
              </p>
              <p className='text-sm text-gray-500'>
                {quote.lineItems.length} items
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Customer Info & Notes */}
            <div className='space-y-6'>
              {/* Enhanced Customer Info */}
              <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                <div className='flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200'>
                  <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-3'>
                    {/* <div className='p-2 bg-blue-100 rounded-lg'>
                      <User className='w-5 h-5 text-blue-600' />
                    </div> */}
                    Customer Details
                  </h3>
                </div>

                <div className='p-6'>
                  <div className='text-center pb-6 border-b border-gray-100 mb-6'>
                    <div className='w-16 h-16 bg-gradient-to-br from-bg-primary/90 to-emerald-800/90 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3'>
                      {quote.customer?.fullName?.charAt(0)}
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-1'>
                      {quote.customer?.fullName}
                    </h4>
                    <p className='text-gray-500 text-sm'>Customer</p>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                      <Mail
                        size={18}
                        className='text-gray-400 mr-3 flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <a
                          href={`mailto:${quote.customer?.emails?.[0]}`}
                          className='text-blue-600 hover:text-blue-800 font-medium truncate block'
                        >
                          {quote.customer?.emails?.[0]}
                        </a>
                      </div>
                    </div>
                    <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                      <Phone
                        size={18}
                        className='text-gray-400 mr-3 flex-shrink-0'
                      />
                      <div className='flex-1'>
                        <p className='text-gray-900 font-medium'>
                          {quote.customer?.customerPhones?.[0].phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start p-3 bg-gray-50 rounded-lg'>
                      <MapPin
                        size={18}
                        className='text-gray-400 mr-3 flex-shrink-0 mt-0.5'
                      />
                      <div className='flex-1'>
                        <p className='text-gray-900 font-medium'>
                          {quote.customer?.properties?.[0]?.street}
                        </p>
                        <p className='text-gray-600 text-sm'>
                          {quote.customer?.properties?.[0]?.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Notes Section */}
              <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                <div className='flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200'>
                  <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-3'>
                    {/* <div className='p-2 bg-green-100 rounded-lg'>
                      <FileText className='w-5 h-5 text-green-600' />
                    </div> */}
                    Notes & Comments
                  </h3>
                  <div className='flex items-center'></div>
                </div>

                <div className='p-6 space-y-4'>
                  <div className='p-4 bg-blue-50 rounded-xl border border-blue-100'>
                    <div className='flex items-center mb-2'>
                      <User className='w-4 h-4 text-blue-600 mr-2' />
                      <h4 className='text-sm font-semibold text-blue-800'>
                        Customer Notes
                      </h4>
                    </div>
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {quote.customerNotes || 'No customer notes available.'}
                    </p>
                  </div>
                  <div className='p-4 bg-amber-50 rounded-xl border border-amber-100'>
                    <div className='flex items-center mb-2'>
                      <Building className='w-4 h-4 text-amber-600 mr-2' />
                      <h4 className='text-sm font-semibold text-amber-800'>
                        Internal Notes
                      </h4>
                    </div>
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {quote.internalNotes || 'No internal notes available.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quote Items & Activity */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Enhanced Quote Items */}
              <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                {/* <div className='p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50'>
                  <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-3'> */}
                {/* <div className='p-2 bg-purple-100 rounded-lg'>
                      <DollarSign className='w-5 h-5 text-purple-600' />
                    </div> */}
                {/* Quote Items
                  </h3>
                </div> */}

                <div>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Item Details
                          </th>
                          <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Quantity
                          </th>
                          <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Unit Price
                          </th>
                          <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {quote.lineItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                            }`}
                          >
                            <td className='px-6 py-4'>
                              <div>
                                <div className='text-sm font-semibold text-gray-900 mb-1'>
                                  {item.name}
                                </div>
                                <div className='text-sm text-gray-500 leading-tight'>
                                  {item.description}
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 text-right'>
                              <span className='inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium text-gray-800'>
                                {item.quantity}
                              </span>
                            </td>
                            <td className='px-6 py-4 text-right text-sm font-semibold text-gray-900'>
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className='px-6 py-4 text-right text-sm font-bold text-gray-900'>
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Totals Section */}
                  <div className='p-6 bg-gradient-to-r bg-gray-50 border-t border-gray-200'>
                    <div className='flex justify-end'>
                      <div className='w-full sm:w-96'>
                        <div className='space-y-3'>
                          <div className='flex justify-between items-center py-2 text-sm font-medium text-gray-700'>
                            <span>Subtotal</span>
                            <span className='font-semibold'>
                              {formatCurrency(quote.subtotal)}
                            </span>
                          </div>
                          {quote.discountValue > 0 && (
                            <div className='flex justify-between items-center py-2 text-sm font-medium text-gray-700'>
                              <span className='flex items-center'>
                                <span>Discount</span>
                                <span className='ml-2 text-xs text-gray-500'>
                                  (
                                  {quote.discountType ===
                                  DiscountType.Percentage
                                    ? `${quote.discountValue}%`
                                    : formatCurrency(quote.discountValue)}
                                  )
                                </span>
                              </span>
                              <span className='font-semibold text-green-600'>
                                -{formatCurrency(quote.discount)}
                              </span>
                            </div>
                          )}
                          <div className='flex justify-between items-center py-2 text-sm font-medium text-gray-700'>
                            <span>Tax ({quote.taxRate * 100}%)</span>
                            <span className='font-semibold'>
                              {formatCurrency(quote.taxAmount)}
                            </span>
                          </div>
                          <div className='flex justify-between items-center pt-4 pb-2 text-xl font-bold text-gray-900 border-t-2 border-gray-300'>
                            <span>Total Amount</span>
                            <span className='text-bg-primary'>
                              {formatCurrency(quote.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Activity Timeline */}
              <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                <div className='flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200'>
                  <h3 className='text-xl font-semibold text-gray-900 flex items-center gap-3'>
                    {/* <div className='p-2 bg-orange-100 rounded-lg'>
                      <Clock className='w-5 h-5 text-orange-600' />
                    </div> */}
                    Activity Timeline
                  </h3>
                </div>

                <div className='p-6'>
                  <div className='flow-root'>
                    <ul className=''>
                      <li className='relative pb-8'>
                        <div className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'></div>
                        <div className='relative flex items-start space-x-3'>
                          <div className='relative'>
                            <div className='h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white'>
                              <Check size={16} className='text-white' />
                            </div>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div>
                              <p className='text-sm font-medium text-gray-900'>
                                Quote Created
                              </p>
                              <p className='mt-0.5 text-sm text-gray-500'>
                                Created by {quote.createdByUser?.fullName}
                              </p>
                            </div>
                            <div className='mt-2 text-sm text-gray-700'>
                              <time dateTime={quote.createdAt}>
                                {formatDate(quote.createdAt)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </li>

                      {quote.viewed && (
                        <li className='relative pb-8'>
                          <div className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'></div>
                          <div className='relative flex items-start space-x-3'>
                            <div className='relative'>
                              <div className='h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white'>
                                <Eye size={16} className='text-white' />
                              </div>
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div>
                                <p className='text-sm font-medium text-gray-900'>
                                  Quote Viewed
                                </p>
                                <p className='mt-0.5 text-sm text-gray-500'>
                                  Customer opened the quote link
                                </p>
                              </div>
                              <div className='mt-2 text-sm text-gray-700'>
                                <time dateTime={quote.viewedAt}>
                                  {formatDate(quote.viewedAt)}
                                </time>
                              </div>
                            </div>
                          </div>
                        </li>
                      )}

                      {/* Future activity items would go here */}
                      <li className='relative'>
                        <div className='relative flex items-start space-x-3'>
                          <div className='relative'>
                            <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center ring-8 ring-white'>
                              <Clock size={16} className='text-gray-500' />
                            </div>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div>
                              <p className='text-sm font-medium text-gray-500'>
                                Waiting for response
                              </p>
                              <p className='mt-0.5 text-sm text-gray-400'>
                                Quote is pending customer action
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Email Modal */}
      <CustomerEmailModal
        isOpen={isEmailModalOpen}
        customerEmail={quote.customer?.emails?.[0] || ''}
        onClose={() => setIsEmailModalOpen(false)}
      />

      {/* Click outside to close actions menu */}
      {showActionsMenu && (
        <div
          className='fixed inset-0 z-5'
          onClick={() => setShowActionsMenu(false)}
        />
      )}
    </div>
  );
};

export default QuoteDetails;
