import { useNavigate, useParams } from 'react-router';
import { DeleteInvoice, GetInvoiceById } from '../../services/Invoice';
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
  Eye,
  CopyIcon,
  HardHat,
  Send,
  Check,
  Archive,
  Trash2,
  CheckCircle,
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
import ActionConfirmationModal from '../../components/Quotes/QuotesModals/ActionConfirmationModal';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<TInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const showMoreRef = useClickOutside<HTMLDivElement>(() =>
    setIsActionsOpen(false)
  ); // Use useClickOutside for the actions dropdown

  const deleteInvoice = async () => {
    if (!invoiceId) return;
    const response = await DeleteInvoice(invoiceId);
    if (response.status === 200) {
      navigate('/invoices');
    }
  };

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
    // Implement actual email sending logic here
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
      <div className='flex-1 ml-64'>
        <Navbar />
        {/* Enhanced Header */}
        <div className='shadow-sm bg-white'>
          <div className='px-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between py-6'>
              <div className=''>
                <h1 className='text-2xl font-bold text-text-primary'>
                  {invoice.title}
                </h1>
                <div className='flex items-center space-x-3'>
                  <p className='text-sm text-gray-500'>
                    Invoice #{invoice.invoiceNumber}
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
                  icon={<Send className='w-4 h-4 mr-2' />}
                  customStyle='py-2 px-4 bg-bg-primary border-none text-white hover:bg-bg-primary-hover'
                  // onClick={() => setIsSendModalOpen(true)}
                  onClick={() => {}}
                >
                  Send
                </IconButton>
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
                          // onClick={() => setIsDuplicateQuoteModalOpen(true)}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <CopyIcon className='w-4 h-4 mr-2' />
                          Duplicate
                        </button>

                        {/* Status group */}
                        <div className='border-t border-gray-100 my-1'></div>
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Status
                        </div>
                        <button
                          // onClick={() =>
                          //   handleChangeQuoteStatus(QuoteStatus.Sent)
                          // }
                          className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Send className='w-4 h-4 mr-2' />
                          Mark as Sent
                        </button>
                        <button
                          // onClick={() =>
                          //   handleChangeQuoteStatus(QuoteStatus.Approved)
                          // }
                          className='flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <CheckCircle className='w-4 h-4 mr-2' />
                          Mark as Paid
                        </button>

                        {/* Actions group */}
                        <div className='border-t border-gray-100 my-1'></div>
                        <div className='px-3 py-1 text-xs font-medium text-gray-500'>
                          Actions
                        </div>

                        <button
                          // onClick={handlePrintQuotePdf}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Printer className='w-4 h-4 mr-2' />
                          Print
                        </button>
                        <button
                          // onClick={handleDownloadQuotePdf}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Download className='w-4 h-4 mr-2' />
                          Download
                        </button>
                        <button
                          onClick={() => setIsArchiveModalOpen(true)}
                          className='w-full cursor-pointer flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <Archive className='w-4 h-4 mr-2' />
                          Archive
                        </button>
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
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
            initial='hidden'
            animate='visible'
            className='w-full flex gap-6'
          >
            {/* Main Content (Left Column) */}
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
                      {invoice.lineItems.map((item) => (
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
                          value: `${formatCurrency(invoice?.subtotal)}`,
                          color: 'text-gray-900',
                        },
                        invoice.discount > 0 && {
                          label: `Discount (${
                            invoice.discountType === DiscountType.Percentage
                              ? `${invoice.discount}%`
                              : formatCurrency(invoice.discount)
                          }):`,
                          value: `-${formatCurrency(
                            invoice.discountType === DiscountType.Percentage
                              ? invoice.subtotal * (invoice.discount / 100)
                              : invoice.discount
                          )}`,
                          color: 'text-green-600',
                        },
                        {
                          label: `Tax (${invoice?.taxRate * 100}%):`,
                          value: `${formatCurrency(
                            (invoice.subtotal -
                              (invoice.discountType === DiscountType.Percentage
                                ? invoice.subtotal * (invoice.discount / 100)
                                : invoice.discount)) *
                              invoice.taxRate
                          )}`,
                          color: 'text-gray-900',
                        },
                        {
                          label: 'Total:',
                          value: `${formatCurrency(invoice?.total)}`,
                          color: 'text-text-primary',
                          isTotal: true,
                          customColor: 'text-text-primary',
                        },
                      ]
                        .filter(Boolean)
                        .map((item, index) => (
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
                                item?.isTotal ? 'font-semibold' : 'font-medium'
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
                        ))}
                      {invoice.isPaid && (
                        <div className='border-t border-gray-200 pt-4 mt-4'>
                          <div className='flex justify-between items-center py-2'>
                            <span className='text-gray-600 text-sm'>
                              Payment on{' '}
                              {DateTime.fromISO(invoice.updatedAt, {
                                zone: 'utc',
                              })
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
                        {invoice.customer?.fullName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {invoice.customer?.companyName}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    {invoice.customer.customerPhones?.length > 0 && (
                      <div className='flex items-center text-sm text-gray-600'>
                        <Phone className='w-4 h-4 mr-3 text-gray-400' />
                        {invoice.customer.customerPhones?.[0]?.phoneNumber}
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
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Invoice Details
                </h3>
                <div className='space-y-3 text-sm'>
                  {invoice.issueDate && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Issue Date</span>
                      <span className='text-gray-900'>
                        {DateTime.fromISO(invoice.issueDate, { zone: 'utc' })
                          .toLocal()
                          .toFormat('MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {invoice.dueDate && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Due Date</span>
                      <span className='text-gray-900'>
                        {DateTime.fromISO(invoice.dueDate, { zone: 'utc' })
                          .toLocal()
                          .toFormat('MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {invoice.paymentTerms && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Payment Terms</span>
                      <span className='text-gray-900'>
                        {getPaymentTermDisplay(invoice.paymentTerms)}
                      </span>
                    </div>
                  )}

                  {invoice.jobId && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Linked Job</span>
                      <a
                        href={`/jobs/${invoice.jobId}`}
                        className='text-blue-600 hover:underline font-medium'
                      >
                        View Job #{invoice.jobId}
                      </a>
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
      <ActionConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteInvoice}
        itemName={invoice.title || 'Invoice'}
        actionType='delete'
        itemType='invoice'
      />
      <ActionConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={() => {}}
        itemName={invoice.title || 'Invoice'}
        actionType='archive'
        itemType='invoice'
      />
    </div>
  );
};

export default InvoiceDetails;
