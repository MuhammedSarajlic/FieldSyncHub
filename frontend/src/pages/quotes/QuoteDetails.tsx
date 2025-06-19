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
} from 'lucide-react';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { GetQuoteById } from '../../services/Quote';
import { useParams } from 'react-router';
import { TQuote } from '../../types/Quote';
import { QuoteStatus } from '../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { getQuoteStatus } from '../../utils/FuntionHelpers/getQuoteStatus';

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState<TQuote>();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
  };

  const handleConvertToJob = () => {
    alert('Converting to job...');
  };

  const fetchCurrentQuote = async () => {
    const response = await GetQuoteById(quoteId as string);
    if (response.status === 200) {
      setQuote(response.data);
    }
    console.log(response);
  };

  useEffect(() => {
    fetchCurrentQuote();
  }, [quoteId]);

  if (!quote) return <p>Loading...</p>;

  return (
    <div className='min-h-screen'>
      <Sidebar />
      <div className='flex-1 ml-[260px] flex flex-col'>
        <Navbar />

        <div className='flex-1 overflow-auto px-4'>
          {/* Header */}
          <div className='mb-6'>
            <div className='flex justify-between items-center'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                  Quote #{quote.quoteNumber}
                </h1>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      getQuoteStatus(quote.status).color
                    }`}
                  >
                    {getQuoteStatus(quote.status).icon}
                    {QuoteStatus[quote.status]}
                  </div>
                  {quote.viewed && (
                    <div className='flex items-center text-gray-500 text-sm'>
                      <Eye size={14} className='mr-1' />
                      <span>Viewed {quote.viewedAt}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {quote.status === QuoteStatus.AwaitingApproval && (
                  <>
                    <button className='flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700'>
                      <Check size={16} className='mr-2' /> Approve
                    </button>
                    <button className='flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700'>
                      <X size={16} className='mr-2' /> Decline
                    </button>
                  </>
                )}
                {quote.status === QuoteStatus.Approved && (
                  <button
                    onClick={handleConvertToJob}
                    className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700'
                  >
                    <ArrowRight size={16} className='mr-2' /> Convert to Job
                  </button>
                )}
                <button
                  onClick={handleSendEmail}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700'
                >
                  <Send size={16} className='mr-2' /> Send
                </button>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className='flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50'
                >
                  <Edit size={16} className='mr-2' /> Edit
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center'>
                <Calendar className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <div className='text-sm text-gray-500'>Created</div>
                  <div className='font-medium'>
                    {formatDate(quote.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center'>
                <Clock className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <div className='text-sm text-gray-500'>Expires</div>
                  <div className='font-medium'>
                    {formatDate(quote.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center'>
                <User className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <div className='text-sm text-gray-500'>Created By</div>
                  <div className='font-medium'>{quote.customer.fullName}</div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center'>
                <DollarSign className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <div className='text-sm text-gray-500'>Total</div>
                  <div className='font-medium text-indigo-600'>
                    {formatCurrency(quote.total)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Customer Info */}
            <div className='lg:col-span-1 space-y-6'>
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                  <User className='h-5 w-5 text-gray-500 mr-2' />
                  Customer
                </h3>
                <div className='space-y-4'>
                  <div className='text-center pb-4 border-b border-gray-100'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-1'>
                      {quote.customer.fullName}
                    </h4>
                    <p className='text-gray-500'>
                      {quote.customer.customerPhones?.[0].phoneNumber}
                    </p>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex items-center'>
                      <Mail size={16} className='text-gray-400 mr-3' />
                      <a
                        href={`mailto:${quote.customer.email?.[0]}`}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        {quote.customer.email?.[0]}
                      </a>
                    </div>
                    <div className='text-gray-600'>
                      {quote.customer.customerPhones?.[0].phoneNumber}
                    </div>
                    <div className='text-gray-600'>
                      {quote.customer.properties?.[0].address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800 flex items-center'>
                    <User className='h-5 w-5 text-gray-500 mr-2' />
                    Notes
                  </h3>
                  {isEditMode && (
                    <button className='text-sm text-blue-600 hover:text-blue-800'>
                      Edit
                    </button>
                  )}
                </div>
                <div className='space-y-4'>
                  <div className='p-4 bg-blue-50 rounded-md border border-blue-100'>
                    <h4 className='text-sm font-semibold text-blue-800 mb-2'>
                      Customer Notes
                    </h4>
                    <p className='text-gray-700'>{quote.notes}</p>
                  </div>
                  <div className='p-4 bg-amber-50 rounded-md border border-amber-100'>
                    <h4 className='text-sm font-semibold text-amber-800 mb-2'>
                      Internal Notes
                    </h4>
                    <p className='text-gray-700'>{quote.internalNotes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Details */}
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
                  <h3 className='text-lg font-semibold text-gray-800 flex items-center'>
                    <DollarSign className='h-5 w-5 text-gray-500 mr-2' />
                    Quote Items
                  </h3>
                  {isEditMode && (
                    <button className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700'>
                      <PlusCircle size={16} className='mr-2' /> Add Item
                    </button>
                  )}
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Item
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Description
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Qty
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Price
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Total
                        </th>
                        {isEditMode && (
                          <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {quote.lineItems.map((item) => (
                        <tr key={item.lineItemId} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                              {item.name}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='text-sm text-gray-500'>
                              {item.description}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-700'>
                            {item.quantity}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-700'>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900'>
                            {formatCurrency(item.totalPrice)}
                          </td>
                          {isEditMode && (
                            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                              <div className='flex justify-end space-x-2'>
                                <button className='text-indigo-600 hover:text-indigo-900'>
                                  <Edit size={16} />
                                </button>
                                <button className='text-red-600 hover:text-red-900'>
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className='p-6 bg-gray-50'>
                  <div className='flex justify-end'>
                    <div className='w-full sm:w-80'>
                      <div className='space-y-3'>
                        <div className='flex justify-between text-sm font-medium text-gray-700'>
                          <span>Subtotal</span>
                          <span>{formatCurrency(quote.subtotal)}</span>
                        </div>
                        <div className='flex justify-between text-sm font-medium text-gray-700'>
                          <span>
                            Discount (
                            {quote.discountType === DiscountType.Percentage
                              ? `${quote.discountAmount}%`
                              : formatCurrency(quote.discountAmount)}
                            )
                          </span>
                          <span>-{formatCurrency(quote.discountAmount)}</span>
                        </div>
                        <div className='flex justify-between text-sm font-medium text-gray-700'>
                          <span>Tax ({quote.tax}%)</span>
                          <span>{formatCurrency(quote.tax.amount)}</span>
                        </div>
                        <div className='flex justify-between pt-3 text-lg font-bold text-indigo-600 border-t border-gray-200'>
                          <span>Total</span>
                          <span>{formatCurrency(quote.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                  <Clock className='h-5 w-5 text-gray-500 mr-2' />
                  Activity Timeline
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3 mt-1'>
                      <Check size={16} />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Quote created
                      </p>
                      <p className='text-sm text-gray-500'>
                        Created by Sarah Johnson
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>May 1, 2023</p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3 mt-1'>
                      <Send size={16} />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Quote sent to customer
                      </p>
                      <p className='text-sm text-gray-500'>
                        Sent via email to john.doe@acmecorp.com
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>May 1, 2023</p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-3 mt-1'>
                      <Eye size={16} />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Quote viewed by customer
                      </p>
                      <p className='text-sm text-gray-500'>
                        Customer opened the quote link
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>May 2, 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl'>
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Send Quote
                </h3>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    To
                  </label>
                  <input
                    type='email'
                    defaultValue={quote.customer.email?.[0]}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Subject
                  </label>
                  <input
                    type='text'
                    defaultValue={`Quote ${quote.id} from ${quote.createdBy}`}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Message
                  </label>
                  <textarea
                    rows={6}
                    defaultValue={`Hi ${
                      quote.customer.customerPhones?.[0].phoneNumber
                    },

Please find attached your quote for the requested services. This quote is valid until ${formatDate(
                      quote.createdAt
                    )}.

If you have any questions or would like to proceed, please don't hesitate to contact us.

Best regards,
${quote.createdBy}`}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div className='flex items-center p-3 bg-blue-50 rounded-md'>
                  <Paperclip size={16} className='text-blue-500 mr-2' />
                  <span className='text-sm text-blue-700'>
                    Quote {quote.id}.pdf will be attached
                  </span>
                </div>
              </div>
            </div>
            <div className='p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3'>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100'
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className='px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700'
              >
                Send Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
