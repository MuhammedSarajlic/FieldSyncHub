import { useParams } from 'react-router';
import { GetInvoiceById } from '../../services/Invoice';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import {
  Printer,
  Mail,
  MessageSquare,
  Download,
  Edit,
  Calendar,
  MoreVertical, // Changed from MoreHorizontal to MoreVertical for consistency with QuoteDetails
  Phone,
  User,
  MapPin,
  FileText,
  Briefcase,
  X,
} from 'lucide-react';
import { TInvoice } from '../../types/Invoice';
import { useAuth } from '../../context/AuthProvider';
import IconButton from '../../components/CustomElements/Buttons/IconButton'; // Changed from CustomIconButton
import { getInvoiceStatus } from '../../utils/FuntionHelpers/getInvoiceStatus';
import UpdateInvoiceModal from '../../components/Invoice/Modal/UpdateInvoiceModal';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { DateTime } from 'luxon';
import { InvoiceStatus } from '../../constants/Enumeration/InvoiceEnum/InvoiceEnum';
import { useClickOutside } from '../../hooks/useClickOutside'; // Import useClickOutside hook
import { motion } from 'framer-motion'; // For dropdown animation
import {
  downloadPdfFile,
  openPdfAndPrint,
} from '../../utils/FuntionHelpers/downloadPdfFile';
import { DiscountType } from '../../constants/Enumeration/CommonEnum/DiscountEnum';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<TInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const showMoreRef = useClickOutside<HTMLDivElement>(() =>
    setIsActionsOpen(false)
  ); // Use useClickOutside for the actions dropdown

  const fetchInvoice = async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      const response = await GetInvoiceById(invoiceId);
      if (response.status === 200) {
        setInvoice(response.data);
      } else {
        console.error(
          'Failed to fetch invoice:',
          response.data?.message || 'Unknown error'
        );
        setInvoice(null); // Explicitly set to null on error
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setInvoice(null); // Explicitly set to null on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const handleSendEmail = () => {
    console.log('Send by email');
    // Implement actual email sending logic here
  };

  const handleSendText = () => {
    console.log('Send by text');
    // Implement actual text sending logic here
  };

  const handleDownloadInvoicePdf = async () => {
    if (!invoiceId) return;
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`); // Replace with your actual API endpoint for PDF
      if (!response.ok) {
        throw new Error('Failed to fetch invoice PDF');
      }
      const blob = await response.blob();
      downloadPdfFile(blob, `Invoice-${invoice?.invoiceNumber}`);
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      // Display user-friendly error message
    }
  };

  const handlePrintInvoicePdf = async () => {
    if (!invoiceId) {
      console.warn('No invoice ID provided');
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`); // Replace with your actual API endpoint for PDF
      if (!response.ok) {
        throw new Error('Failed to fetch invoice PDF');
      }
      const blob = await response.blob();
      openPdfAndPrint(blob);
    } catch (error) {
      console.error('Error preparing PDF for printing:', error);
      // Display user-friendly error message
    }
  };

  if (loading) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 ml-[260px]'>
          <Navbar />
          <div className='p-8 flex items-center justify-center h-full min-h-[calc(100vh-64px)]'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-bg-primary'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 ml-[260px]'>
          <Navbar />
          <div className='p-8 text-center min-h-[calc(100vh-64px)] flex flex-col justify-center items-center'>
            <X className='w-16 h-16 text-red-500 mb-4' />
            <h2 className='text-2xl font-bold text-gray-800 mb-3'>
              Invoice Not Found
            </h2>
            <p className='text-gray-500'>
              The requested invoice could not be found or an error occurred.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentTermDisplay = (paymentTerm: string): string => {
    switch (paymentTerm) {
      case 'net30':
        return 'Net 30 days';
      case 'net15':
        return 'Net 15 days';
      case 'uponReceipt':
        return 'Upon receipt';
      case 'custom':
        return 'Custom Due Date';
      default:
        return paymentTerm;
    }
  };

  // Determine which property to display (job property takes precedence if job exists)
  const displayProperty =
    invoice.job?.property || invoice.customer.properties?.[0];

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />
        {/* Enhanced Header */}
        <div className='shadow-sm bg-white'>
          <div className='px-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between py-6'>
              <div className=''>
                <h1 className='text-2xl font-bold text-text-primary'>
                  Invoice #{invoice.invoiceNumber}
                </h1>
                <div className='flex items-center space-x-3'>
                  <p className='text-sm text-gray-500'>
                    {invoice.customer.isCompany
                      ? invoice.customer.companyName
                      : invoice.customer.fullName}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getInvoiceStatus(invoice.status).color
                    } shadow-sm`}
                  >
                    {getInvoiceStatus(invoice.status).icon}
                    <span className='ml-1 capitalize'>
                      {InvoiceStatus[invoice.status]}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 relative'>
                <IconButton
                  icon={<Edit className='w-4 h-4 mr-2' />}
                  customStyle='py-2 px-4 hover:border-gray-300'
                  onClick={() => setIsUpdateModalOpen(true)}
                >
                  Edit
                </IconButton>

                <div className='relative' ref={showMoreRef}>
                  <IconButton
                    icon={<MoreVertical className='w-4 h-4 mr-2' />}
                    customStyle='py-2 px-4 hover:border-gray-300'
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                  >
                    More
                  </IconButton>

                  {isActionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg border border-gray-200 z-10'
                    >
                      <div className='py-1'>
                        {/* Actions group */}
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Actions
                        </div>
                        <button
                          onClick={() => {
                            handleSendEmail();
                            setIsActionsOpen(false);
                          }}
                          className='flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Mail className='w-4 h-4' />
                          Email
                        </button>
                        <button
                          onClick={() => {
                            handleSendText();
                            setIsActionsOpen(false);
                          }}
                          className='flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <MessageSquare className='w-4 h-4' />
                          Text
                        </button>
                        <button
                          onClick={() => {
                            handleDownloadInvoicePdf();
                            setIsActionsOpen(false);
                          }}
                          className='flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Download className='w-4 h-4' />
                          Download
                        </button>
                        <button
                          onClick={() => {
                            handlePrintInvoicePdf();
                            setIsActionsOpen(false);
                          }}
                          className='flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Printer className='w-4 h-4' />
                          Print
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
        <div className='px-6 py-8'>
          <motion.div
            initial='hidden'
            animate='visible'
            className='grid grid-cols-1 lg:grid-cols-3 gap-6'
          >
            {/* Main Content (Left Column) */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Line Items */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        {['Item', 'Qty', 'Unit Price', 'Total'].map(
                          (header) => (
                            <th
                              key={header}
                              className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                header === 'Item' ? 'text-left' : 'text-right'
                              }`}
                            >
                              {header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {invoice.lineItems.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className='px-6 py-4'>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-gray-900 truncate'>
                                {item.name}
                              </p>
                              {item.description && (
                                <p className='text-sm text-gray-500'>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900'>
                            {item.quantity}
                          </td>
                          <td className='px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className='px-6 py-4 text-right whitespace-nowrap text-sm font-medium text-gray-900'>
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pricing Summary */}
                <div className='bg-gray-50 p-6 border-t border-gray-200'>
                  <div className='flex justify-end'>
                    <div className='w-full md:w-2/3 lg:w-1/2 space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Subtotal:</span>
                        <span className='font-medium text-gray-900'>
                          {formatCurrency(invoice.subtotal)}
                        </span>
                      </div>

                      {invoice.discount > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>
                            Discount (
                            {invoice.discountType === DiscountType.Percentage
                              ? `${invoice.discount}%`
                              : formatCurrency(invoice.discount)}
                            ):
                          </span>
                          <span className='font-medium text-red-600'>
                            -
                            {formatCurrency(
                              invoice.discountType === DiscountType.Percentage
                                ? invoice.subtotal * (invoice.discount / 100)
                                : invoice.discount
                            )}
                          </span>
                        </div>
                      )}

                      <div className='flex justify-between'>
                        <span className='text-gray-600'>
                          Tax ({invoice.taxRate * 100}%):
                        </span>
                        <span className='font-medium text-gray-900'>
                          {formatCurrency(
                            (invoice.subtotal - invoice.discount) *
                              invoice.taxRate
                          )}
                        </span>
                      </div>

                      <div className='pt-2 border-t border-gray-200 flex justify-between items-center'>
                        <span className='font-semibold text-text-primary text-lg'>
                          Total:
                        </span>
                        <span className='font-semibold text-text-primary text-lg'>
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>

                      {invoice.isPaid && (
                        <div className='border-t border-gray-200 pt-4 mt-4'>
                          <div className='flex justify-between items-center py-2'>
                            <span className='text-gray-600 text-sm'>
                              Payment on{' '}
                              {DateTime.fromISO(invoice.updatedAt, {
                                zone: 'utc',
                              }) // Assuming updatedAt marks payment date
                                .toLocal()
                                .toFormat('MMM dd, yyyy')}
                            </span>
                            <span className='font-medium text-gray-600'>
                              {formatCurrency(invoice.total)}
                            </span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-base font-semibold text-gray-800'>
                              Balance Due
                            </span>
                            <span className='text-lg font-bold text-gray-800'>
                              {formatCurrency(0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar (Right Column) */}
            <div className='lg:col-span-1 space-y-6'>
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
                        {invoice.customer?.fullName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {invoice.customer?.companyName}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    {invoice.customer?.customerPhones?.[0]?.phoneNumber && (
                      <div className='flex items-center text-sm text-gray-600'>
                        <Phone className='w-4 h-4 mr-3 text-gray-400' />
                        {invoice.customer.customerPhones[0].phoneNumber}
                      </div>
                    )}
                    {invoice.customer?.emails?.[0] && (
                      <div className='flex items-center text-sm text-gray-600'>
                        <Mail className='w-4 h-4 mr-3 text-gray-400' />
                        {invoice.customer.emails[0]}
                      </div>
                    )}
                    {displayProperty && (
                      <div className='flex items-start'>
                        <MapPin className='w-5 h-5 text-gray-400 mt-0.5 mr-2.5' />
                        <div>
                          <p className='text-xs text-gray-500'>
                            Service location
                          </p>
                          <p className='text-sm font-medium text-gray-900'>
                            {displayProperty.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Details Section */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Invoice Details
                </h3>
                <div className='space-y-3 text-sm text-gray-700'>
                  {/* Issue Date */}
                  {invoice.issueDate && (
                    <div className='flex items-center'>
                      <Calendar className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Issue Date:{' '}
                        <span className='font-medium'>
                          {DateTime.fromISO(invoice.issueDate, { zone: 'utc' })
                            .toLocal()
                            .toFormat('MMM dd, yyyy')}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Due Date */}
                  {invoice.dueDate && (
                    <div className='flex items-center'>
                      <Calendar className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Due Date:{' '}
                        <span className='font-medium'>
                          {DateTime.fromISO(invoice.dueDate, { zone: 'utc' })
                            .toLocal()
                            .toFormat('MMM dd, yyyy')}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Payment Terms */}
                  {invoice.paymentTerms && (
                    <div className='flex items-center'>
                      <FileText className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Payment Terms:{' '}
                        <span className='font-medium'>
                          {getPaymentTermDisplay(invoice.paymentTerms)}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Link to Job (if converted) */}
                  {invoice.jobId && (
                    <div className='flex items-center'>
                      <Briefcase className='w-4 h-4 mr-3 text-gray-400' />
                      <p>
                        Linked Job:{' '}
                        <a
                          href={`/jobs/${invoice.jobId}`} // Adjust this path to your actual job details route
                          className='text-blue-600 hover:underline font-medium'
                        >
                          View Job #{invoice.jobId}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Internal Notes
                </h3>
                {invoice.internalNotes ? (
                  <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                    {invoice.internalNotes}
                  </p>
                ) : (
                  <div className='text-center py-4 px-2 bg-gray-50 rounded-lg border border-gray-200'>
                    <p className='text-gray-500 text-sm'>
                      No internal notes added.
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Notes */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Customer Notes
                </h3>
                {invoice.notes ? (
                  <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                    {invoice.notes}
                  </p>
                ) : (
                  <div className='text-center py-4 px-2 bg-gray-50 rounded-lg border border-gray-200'>
                    <p className='text-gray-500 text-sm'>
                      No customer notes added.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {isUpdateModalOpen && invoice && (
        <UpdateInvoiceModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          invoice={invoice}
        />
      )}
    </div>
  );
};

export default InvoiceDetails;
