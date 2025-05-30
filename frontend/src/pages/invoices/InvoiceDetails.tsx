import { useParams } from 'react-router';
import { GetInvoiceByInvoiceNumber } from '../../services/Invoice';
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
  MoreHorizontal,
  Phone,
} from 'lucide-react';
import { TInvoice } from '../../types/Invoice';
import { useAuth } from '../../context/AuthProvider';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import images from '../../constants/images';
import { getInvoiceStatus } from '../../utils/FuntionHelpers/getInvoiceStatus';
import UpdateInvoiceModal from '../../components/Invoice/Modal/UpdateInvoiceModal';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<TInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await GetInvoiceByInvoiceNumber(invoiceId);
      console.log(response);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    console.log('Send by email');
  };

  const handleSendText = () => {
    console.log('Send by text');
  };

  const handleDownload = () => {
    console.log('Download PDF');
  };

  const handleEdit = () => {
    console.log('Edit invoice');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className='flex-1 ml-[260px]'>
          <Navbar />
          <div className='p-8 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
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
          <div className='p-8 text-center'>
            <h2 className='text-2xl font-bold text-gray-800 mb-3'>
              Invoice Not Found
            </h2>
            <p className='text-gray-500'>
              The requested invoice could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentTerm = (paymentTerm: string) => {
    return (
      PaymentTerms[paymentTerm as keyof typeof PaymentTerms] || paymentTerm
    );
  };

  enum PaymentTerms {
    net30 = 'Net 30 days',
    net15 = 'Net 15 days',
    uponReceipt = 'Upon receipt',
  }

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />

        {/* Page header */}
        <div className='bg-white px-4 '></div>

        {/* Invoice Document */}
        <div className='p-8 min-h-screen'>
          {/* action buttons */}
          <div className='flex justify-end gap-4 max-w-3/4 mx-auto mb-4'>
            <div className='flex flex-wrap gap-3 relative'>
              <CustomIconButton
                icon={<Edit className='w-4 h-4 mr-2' />}
                text='Edit'
                handleClick={() => setIsUpdateModalOpen(true)}
              />

              <div className='relative'>
                <button
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className='flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                >
                  <MoreHorizontal className='w-4 h-4' />
                  Actions
                </button>

                {isActionsOpen && (
                  <div className='absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-md focus:outline-none z-10 border border-gray-100'>
                    <div className=''>
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
                      <hr className='border-gray-100' />
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
                      <hr className='border-gray-100' />
                      <button
                        onClick={() => {
                          handleDownload();
                          setIsActionsOpen(false);
                        }}
                        className='flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        <Download className='w-4 h-4' />
                        Download
                      </button>
                      <hr className='border-gray-100' />
                      <button
                        onClick={() => {
                          handlePrint();
                          setIsActionsOpen(false);
                        }}
                        className='flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        <Printer className='w-4 h-4' />
                        Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='max-w-3/4 mx-auto bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100'>
            {/* Invoice header */}
            <div className='p-8 pt-12 border-b border-gray-100'>
              <div className='flex justify-between items-start'>
                <div className='flex items-start gap-6'>
                  <div className='w-42 h-42 border border-gray-100 rounded-lg flex items-center justify-center'>
                    <img
                      src={images.invLogo}
                      alt='w-full h-full object-contain'
                    />
                  </div>

                  <div className=''>
                    <div className='pb-4 border-b-1 border-gray-100'>
                      <div className='flex items-center space-x-4'>
                        <div className='text-sm text-gray-500 mb-1'>
                          #{invoice.invoiceNumber}
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              getInvoiceStatus(invoice.status).color
                            }`}
                          >
                            {getInvoiceStatus(invoice.status).icon}
                            <span className='ml-1 capitalize'>
                              {invoice.status}
                            </span>
                          </span>
                        </div>
                      </div>
                      <h1 className='text-3xl font-bold text-gray-900'>
                        {invoice.customer.isCompany
                          ? invoice.customer.companyName
                          : `${invoice.customer.fullName}`}
                      </h1>
                    </div>
                    <div className='flex gap-10 mb-8 pt-4'>
                      <div>
                        <div className='text-sm text-gray-500 mb-1'>
                          AMOUNT DUE
                        </div>
                        <div className=' font-bold text-gray-900'>
                          {formatCurrency(invoice.total)}
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <div>
                          <div className='text-sm text-gray-500 mb-1'>
                            ISSUE DATE
                          </div>
                          <div className='flex items-center space-x-1.5'>
                            <Calendar className='w-4 h-4 text-blue-600' />
                            <p className='font-medium text-blue-600'>
                              {formatDate(invoice.issueDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <div>
                          <div className='text-sm text-gray-500 mb-1'>
                            DATE DUE
                          </div>
                          {invoice.paymentTerms === 'custom' ? (
                            <div className='flex items-center space-x-1.5'>
                              <Calendar className='w-4 h-4 text-blue-600' />
                              <p className='font-medium text-blue-600'>
                                {formatDate(invoice.dueDate)}
                              </p>
                            </div>
                          ) : (
                            <p className='font-medium text-gray-800'>
                              {getPaymentTerm(invoice.paymentTerms)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className=' font-semibold text-gray-700 mb-1'>
                    {user?.workspace.name}
                  </div>
                  <div className='text-sm text-gray-600 space-y-0.5'>
                    <div>1627 Ocean Drive</div>
                    <div>Capital City, Ohio 83502</div>
                    <div className='mt-2'>(531) 987-6543</div>
                    <div>www.example.com</div>
                    <div>contractor lic #30-2631-28</div>
                  </div>
                  {/* <button className='text-blue-600 mt-3 flex items-center gap-1 ml-auto cursor-pointer'>
                    <Edit className='w-4 h-4 mr-1' />
                    Edit company details
                  </button> */}
                </div>
              </div>
            </div>

            {/* Customer details and address */}
            <div className='p-8'>
              <div className='grid grid-cols-3 gap-6'>
                <div>
                  <div className='mb-3'>
                    <div className='text-sm font-semibold text-gray-800'>
                      Billing address
                    </div>
                  </div>
                  <div className=''>
                    <p className='text-sm text-gray-600'>
                      {invoice.customer.properties[0].street},{' '}
                      {invoice.customer.properties[0].city},{' '}
                      {invoice.customer.properties[0].state}{' '}
                      {invoice.customer.properties[0].postalCode}
                    </p>
                  </div>
                </div>

                <div>
                  <div className='flex justify-between items-center mb-3'>
                    <div className='text-sm font-semibold text-gray-800'>
                      Property address{' '}
                      {invoice.customer.properties[0].isBillingAddress && (
                        <span className='text-gray-500 font-normal'>
                          (same as billing address)
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={` ${
                      invoice.customer?.properties[0].isBillingAddress &&
                      'opacity-50'
                    }`}
                  >
                    <p className='text-sm text-gray-600'>
                      {invoice.customer.properties[0].street},{' '}
                      {invoice.customer.properties[0].city},{' '}
                      {invoice.customer.properties[0].state}{' '}
                      {invoice.customer.properties[0].postalCode}
                    </p>
                  </div>
                </div>

                <div>
                  <div className='flex justify-between items-center mb-3'>
                    <div className='text-sm font-semibold text-gray-800'>
                      Billing contact
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-600 space-y-2'>
                      {invoice.customer.email.length > 0 && (
                        <div className='flex items-center gap-2'>
                          <Mail className='w-4 h-4' />
                          <span>{invoice.customer.email[0]}</span>
                        </div>
                      )}
                      {invoice.customer.customerPhones.length > 0 && (
                        <div className='flex items-center gap-2'>
                          <Phone className='w-4 h-4' />
                          <span>
                            {invoice.customer?.customerPhones
                              ? invoice.customer?.customerPhones[0]?.phoneNumber
                              : 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className='p-8'>
              <h3 className='text-lg font-semibold text-gray-800 mb-6'>
                Invoice Items
              </h3>

              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-3 px-2 font-semibold text-gray-700 uppercase text-xs tracking-wider'>
                        Name/Description
                      </th>
                      <th className='text-right py-3 px-2 font-semibold text-gray-700 uppercase text-xs tracking-wider'>
                        Qty
                      </th>
                      <th className='text-right py-3 px-2 font-semibold text-gray-700 uppercase text-xs tracking-wider'>
                        Unit Price ($)
                      </th>
                      <th className='text-right py-3 px-2 font-semibold text-gray-700 uppercase text-xs tracking-wider'>
                        Subtotal ($)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr
                        key={item.lineItemId || index}
                        className='border-b border-gray-100'
                      >
                        <td className='py-4 px-2'>
                          <div>
                            <p className='font-medium text-gray-800'>
                              {item.name}
                            </p>
                            {item.description && (
                              <p className='text-xs text-gray-500 mt-1 leading-relaxed'>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className='py-4 px-2 text-right font-medium text-gray-800'>
                          {item.quantity.toFixed(2)}
                        </td>
                        <td className='py-4 px-2 text-right font-medium text-gray-800'>
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className='py-4 px-2 text-right font-semibold text-gray-800'>
                          {item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className='p-8'>
              <div className='flex justify-end'>
                <div className='w-full max-w-md'>
                  <div className='rounded-lg p-6'>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center py-2'>
                        <span className='text-gray-600 text-sm'>Subtotal</span>
                        <span className='text-gray-600'>
                          {formatCurrency(invoice.subtotal)}
                        </span>
                      </div>

                      <div className='flex justify-between items-center py-2'>
                        <span className='text-gray-600 text-sm'>
                          Tax ({(invoice.taxRate * 100).toFixed(1)}%)
                        </span>
                        <span className='text-gray-600'>
                          {formatCurrency(invoice.subtotal * invoice.taxRate)}
                        </span>
                      </div>

                      {invoice.discount > 0 && (
                        <div className='flex justify-between items-center py-2'>
                          <span className='text-gray-600 text-sm'>
                            Discount
                          </span>
                          <span className='text-gray-600'>
                            -{formatCurrency(invoice.discount)}
                          </span>
                        </div>
                      )}

                      <div className='border-t border-gray-200 pt-4 mt-4'>
                        <div className='flex justify-between items-center'>
                          <span className='text-base font-semibold text-gray-800'>
                            Total
                          </span>
                          <span className='text-lg font-bold text-gray-800'>
                            {formatCurrency(invoice.total)}
                          </span>
                        </div>
                      </div>

                      {invoice.isPaid && (
                        <div className='border-t border-gray-200 pt-4 mt-4'>
                          <div className='flex justify-between items-center py-2'>
                            <span className='text-gray-600 text-sm'>
                              Payment on {formatDate(invoice.issueDate)}
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
                              $0.00
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/*Notes*/}
            {invoice.notes && (
              <div className='px-8 pt-8 space-y-2 mb-12'>
                <p className='font-semibold text-gray-800'>Customer Notes</p>
                <p className='text-sm text-gray-500'>{invoice.notes}</p>
              </div>
            )}
            {invoice.internalNotes && (
              <div className='px-8 pt-8 space-y-2 mb-12'>
                <p className='font-semibold text-gray-800'>Internal Notes</p>
                <p className='text-sm text-gray-500'>{invoice.internalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isUpdateModalOpen && (
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
