import { InvoiceStatus } from '../../../../../constants/Enumeration/InvoiceEnum/InvoiceEnum';
import { TInvoice } from '../../../../../types/Invoice';
import { formatCurrency } from '../../../../../utils/FuntionHelpers/formatCurrency';
import { formatDate } from '../../../../../utils/FuntionHelpers/formatDate';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getInvoiceStatus } from '../../../../../utils/FuntionHelpers/getInvoiceStatus';

interface ICustomerDetailsInvoiceItem {
  invoice: TInvoice;
}

const InvoiceTabItem = ({ invoice }: ICustomerDetailsInvoiceItem) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/invoices/${invoice.id}`)}
      className='group flex flex-col sm:flex-row items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      {/* Left Section: Invoice Number and Status */}
      <div className='flex-1 min-w-0 space-y-2'>
        <div className='flex items-center gap-3'>
          <h3 className='text-base font-semibold text-gray-900 truncate'>
            Invoice #{invoice.invoiceNumber || 'N/A'}
          </h3>
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              getInvoiceStatus(invoice.status).color
            }`}
          >
            {InvoiceStatus[invoice.status]}
          </div>
        </div>

        {/* Associated Job (if any) */}
        <div className='flex items-center gap-1.5 text-gray-600 text-sm'>
          <Calendar className='h-4 w-4 flex-shrink-0 text-gray-400' />
          <span>Issued: {formatDate(invoice.issueDate)}</span>
        </div>
      </div>

      {/* Right Section: Total Amount and Dates */}
      <div className='flex-shrink-0 text-right space-y-1'>
        <div className='font-semibold text-lg text-gray-900'>
          {formatCurrency(invoice.total)}
        </div>
        <div className='flex items-center gap-1.5 text-sm text-gray-600'>
          <Calendar className='h-4 w-4 flex-shrink-0 text-gray-400' />
          <span>Due: {formatDate(invoice.dueDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTabItem;
