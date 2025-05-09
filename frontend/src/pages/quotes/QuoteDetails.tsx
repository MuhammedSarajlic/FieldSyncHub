import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Check,
  X,
  Send,
  Printer,
  Eye,
  ArrowRight,
  Edit,
  PlusCircle,
  Clock,
  Download,
  Calendar,
  User,
  DollarSign,
  Paperclip,
  MessageSquare,
  Trash,
  ChevronDown,
  AlertCircle,
  Mail,
  ExternalLink,
  MoreHorizontal,
  Copy,
} from 'lucide-react';

const QuoteDetails = () => {
  const [quote, setQuote] = useState({
    id: 'QT-2023-001',
    customer: {
      name: 'Acme Corporation',
      contact: 'John Doe',
      email: 'john.doe@acmecorp.com',
      phone: '(555) 123-4567',
      address: '123 Business Ave, Suite 100, New York, NY 10001',
    },
    status: 'Awaiting Approval',
    viewed: true,
    viewedAt: '2023-05-02 14:30',
    createdAt: '2023-05-01',
    expiresAt: '2023-05-30',
    createdBy: 'Sarah Johnson',
    lineItems: [
      {
        id: 1,
        name: 'Website Development',
        description: 'Full website development including responsive design',
        quantity: 1,
        price: 3500,
        total: 3500,
      },
      {
        id: 2,
        name: 'Maintenance Package',
        description: '12-month website maintenance and support',
        quantity: 1,
        price: 1200,
        total: 1200,
      },
      {
        id: 3,
        name: 'SEO Package',
        description: 'Basic SEO optimization package',
        quantity: 1,
        price: 800,
        total: 800,
      },
    ],
    subtotal: 5500,
    discount: { type: 'percentage', value: 10, amount: 550 },
    tax: { rate: 7.5, amount: 371.25 },
    total: 5321.25,
    notes:
      'This quote is valid for 30 days. Payment terms: 50% upfront, 50% upon completion.',
    internalNotes:
      'Customer requested rush delivery if possible. Approved for 10% discount due to being a repeat customer.',
  });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleApprove = () => {
    setQuote({ ...quote, status: 'Approved' });
    // API call would go here
  };

  const handleDecline = () => {
    setQuote({ ...quote, status: 'Declined' });
    // API call would go here
  };

  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
    // Email sending logic would go here
  };

  const handleConvertToJob = () => {
    // Convert to job logic would go here
    alert('Converting to job...');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Awaiting Approval':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Declined':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Expired':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft':
        return null;
      case 'Awaiting Approval':
        return <Clock size={14} className='mr-1' />;
      case 'Approved':
        return <Check size={14} className='mr-1' />;
      case 'Declined':
        return <X size={14} className='mr-1' />;
      case 'Expired':
        return <AlertCircle size={14} className='mr-1' />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-[260px] flex flex-col'>
        <Navbar />

        <div className='flex-1 overflow-auto'>
          {/* Header */}
          <div className='bg-white border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                  <h1 className='text-2xl font-semibold text-gray-900'>
                    Quote #{quote.id}
                  </h1>
                  <div
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      quote.status
                    )} flex items-center`}
                  >
                    {getStatusIcon(quote.status)}
                    {quote.status}
                  </div>
                  {quote.viewed && (
                    <div className='ml-3 flex items-center text-sm text-gray-500'>
                      <Eye size={14} className='mr-1' />
                      <span>Viewed {quote.viewedAt}</span>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  {quote.status === 'Awaiting Approval' && (
                    <>
                      <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
                        <Check size={16} className='mr-1' /> Approve
                      </button>
                      <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                        <X size={16} className='mr-1' /> Decline
                      </button>
                    </>
                  )}
                  {quote.status === 'Approved' && (
                    <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                      <ArrowRight size={16} className='mr-1' /> Convert to Job
                    </button>
                  )}
                  <button
                    onClick={handleSendEmail}
                    className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <Send size={16} className='mr-1' /> Send
                  </button>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    <Edit size={16} className='mr-1' /> Edit
                  </button>
                  <div className='relative'>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {isMenuOpen && (
                      <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10'>
                        <button className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'>
                          <Printer size={16} className='mr-2' /> Print Quote
                        </button>
                        <button className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'>
                          <Download size={16} className='mr-2' /> Download PDF
                        </button>
                        <button className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'>
                          <Copy size={16} className='mr-2' /> Duplicate Quote
                        </button>
                        <button className='flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left'>
                          <Trash size={16} className='mr-2' /> Delete Quote
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Summary */}
              <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-100 rounded-md p-3'>
                        <Calendar className='h-6 w-6 text-blue-600' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Created
                          </dt>
                          <dd className='text-lg font-semibold text-gray-900'>
                            {formatDate(quote.createdAt)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-amber-100 rounded-md p-3'>
                        <Clock className='h-6 w-6 text-amber-600' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Expires
                          </dt>
                          <dd className='text-lg font-semibold text-gray-900'>
                            {formatDate(quote.expiresAt)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-green-100 rounded-md p-3'>
                        <User className='h-6 w-6 text-green-600' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Created By
                          </dt>
                          <dd className='text-lg font-semibold text-gray-900'>
                            {quote.createdBy}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-indigo-100 rounded-md p-3'>
                        <DollarSign className='h-6 w-6 text-indigo-600' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total
                          </dt>
                          <dd className='text-lg font-semibold text-gray-900'>
                            {formatCurrency(quote.total)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Customer Info */}
              <div className='lg:col-span-1'>
                <div className='bg-white shadow rounded-lg mb-6'>
                  <div className='px-6 py-5 border-b border-gray-200'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Customer
                    </h3>
                  </div>
                  <div className='px-6 py-5'>
                    <div className='space-y-4'>
                      <div>
                        <h4 className='text-base font-medium text-gray-900'>
                          {quote.customer.name}
                        </h4>
                        <p className='text-sm text-gray-500'>
                          {quote.customer.contact}
                        </p>
                      </div>
                      <div className='flex items-center'>
                        <Mail size={16} className='text-gray-400 mr-2' />
                        <a
                          href={`mailto:${quote.customer.email}`}
                          className='text-sm text-blue-600 hover:text-blue-800'
                        >
                          {quote.customer.email}
                        </a>
                      </div>
                      <div className='flex items-center'>
                        {/* <Phone size={16} className="text-gray-400 mr-2" /> */}
                        <span className='text-sm text-gray-500'>
                          {quote.customer.phone}
                        </span>
                      </div>
                      <div className='flex'>
                        {/* <Map size={16} className="text-gray-400 mr-2 flex-shrink-0 mt-1" /> */}
                        <span className='text-sm text-gray-500'>
                          {quote.customer.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Actions */}
                <div className='bg-white shadow rounded-lg mb-6'>
                  <div className='px-6 py-5 border-b border-gray-200'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Actions
                    </h3>
                  </div>
                  <div className='px-6 py-5'>
                    <div className='space-y-3'>
                      <a
                        href='#'
                        className='flex items-center justify-between py-2 px-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100'
                      >
                        <span className='flex items-center'>
                          <ExternalLink size={16} className='mr-2' />
                          Customer View Link
                        </span>
                        <Copy size={14} />
                      </a>
                      <a
                        href='#'
                        className='flex items-center justify-between py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100'
                      >
                        <span className='flex items-center'>
                          <Eye size={16} className='mr-2' />
                          View Activity Log
                        </span>
                        <ChevronDown size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className='bg-white shadow rounded-lg'>
                  <div className='px-6 py-5 border-b border-gray-200 flex justify-between items-center'>
                    <h3 className='text-lg font-medium text-gray-900'>Notes</h3>
                    {isEditMode && (
                      <button className='text-sm text-blue-600 hover:text-blue-800'>
                        Edit
                      </button>
                    )}
                  </div>
                  <div className='px-6 py-5'>
                    <div className='mb-6'>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Customer Notes
                      </h4>
                      <p className='text-sm text-gray-600'>{quote.notes}</p>
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Internal Notes
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {quote.internalNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              <div className='lg:col-span-2'>
                <div className='bg-white shadow rounded-lg overflow-hidden'>
                  <div className='px-6 py-5 border-b border-gray-200 flex justify-between items-center'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Quote Items
                    </h3>
                    {isEditMode && (
                      <button className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                        <PlusCircle size={14} className='mr-1' /> Add Item
                      </button>
                    )}
                  </div>

                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Item
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Description
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
                            Price
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                          >
                            Total
                          </th>
                          {isEditMode && (
                            <th
                              scope='col'
                              className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                            >
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {quote.lineItems.map((item) => (
                          <tr key={item.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                              {item.name}
                            </td>
                            <td className='px-6 py-4 text-sm text-gray-500'>
                              {item.description}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right'>
                              {item.quantity}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right'>
                              {formatCurrency(item.price)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium'>
                              {formatCurrency(item.total)}
                            </td>
                            {isEditMode && (
                              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                <button className='text-indigo-600 hover:text-indigo-900 mr-2'>
                                  <Edit size={16} />
                                </button>
                                <button className='text-red-600 hover:text-red-900'>
                                  <Trash size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className='border-t border-gray-200 px-6 py-5 bg-gray-50'>
                    <div className='flex flex-col sm:flex-row sm:justify-end'>
                      <div className='w-full sm:w-64'>
                        <div className='flex justify-between py-2 text-sm text-gray-700'>
                          <span>Subtotal</span>
                          <span>{formatCurrency(quote.subtotal)}</span>
                        </div>
                        <div className='flex justify-between py-2 text-sm text-gray-700'>
                          <span>
                            Discount (
                            {quote.discount.type === 'percentage'
                              ? `${quote.discount.value}%`
                              : formatCurrency(quote.discount.value)}
                            )
                          </span>
                          <span>-{formatCurrency(quote.discount.amount)}</span>
                        </div>
                        <div className='flex justify-between py-2 text-sm text-gray-700'>
                          <span>Tax ({quote.tax.rate}%)</span>
                          <span>{formatCurrency(quote.tax.amount)}</span>
                        </div>
                        <div className='flex justify-between py-2 text-base font-medium text-gray-900 border-t border-gray-200 mt-2 pt-2'>
                          <span>Total</span>
                          <span>{formatCurrency(quote.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className='bg-white shadow rounded-lg mt-6'>
                  <div className='px-6 py-5 border-b border-gray-200 flex justify-between items-center'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Attachments
                    </h3>
                    {isEditMode && (
                      <button className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                        <PlusCircle size={14} className='mr-1' /> Add Files
                      </button>
                    )}
                  </div>
                  <div className='px-6 py-5'>
                    {isEditMode ? (
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-12 text-center'>
                        <div className='flex justify-center'>
                          <Paperclip size={24} className='text-gray-400' />
                        </div>
                        <p className='mt-2 text-sm text-gray-500'>
                          Drag and drop files here, or click to select files
                        </p>
                        <p className='mt-1 text-xs text-gray-500'>
                          PDF, PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className='text-center py-6 text-gray-500 text-sm italic'>
                        No attachments yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>
                Send Quote to Customer
              </h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className='text-gray-400 hover:text-gray-500'
              >
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='email-to'
                  className='block text-sm font-medium text-gray-700'
                >
                  To
                </label>
                <input
                  type='email'
                  id='email-to'
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  value={quote.customer.email}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor='email-subject'
                  className='block text-sm font-medium text-gray-700'
                >
                  Subject
                </label>
                <input
                  type='text'
                  id='email-subject'
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  defaultValue={`Your Quote #${quote.id} from Company Name`}
                />
              </div>
              <div>
                <label
                  htmlFor='email-message'
                  className='block text-sm font-medium text-gray-700'
                >
                  Message
                </label>
                <textarea
                  id='email-message'
                  rows={5}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  defaultValue={`Dear ${quote.customer.contact},

Please find attached your quote #${quote.id}. You can review and approve this quote online by clicking the link in this email.

Thank you for your business!

Best regards,
Company Name`}
                />
              </div>
              <div className='flex items-center'>
                <input
                  id='attach-pdf'
                  type='checkbox'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  defaultChecked
                />
                <label
                  htmlFor='attach-pdf'
                  className='ml-2 block text-sm text-gray-700'
                >
                  Attach PDF copy of quote
                </label>
              </div>
            </div>

            <div className='mt-5 flex justify-end'>
              <button
                type='button'
                onClick={() => setIsEmailModalOpen(false)}
                className='mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Cancel
              </button>
              <button
                type='button'
                className='inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <Send size={16} className='mr-2' /> Send Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
