import { TInvoice } from '../../../../../types/Invoice';
import { formatCurrency } from '../../../../../utils/FuntionHelpers/formatCurrency';
import { formatDate } from '../../../../../utils/FuntionHelpers/formatDate';

interface ICustomerDetailsInvoiceItem {
  invoice: TInvoice;
}

const CustomerDetailsInvoiceItem = ({
  invoice,
}: ICustomerDetailsInvoiceItem) => {
  return (
    <div className='px-4 py-2 flex items-start justify-between w-full border-t-[1px] border-border-primary cursor-pointer hover:bg-[#FAFAFA]'>
      <div className='w-1/4 flex flex-col items-start space-y-1'>
        <p className='font-bold text-heading'>{invoice.invoiceNumber}</p>
        <div className='px-2 py-1 rounded-full bg-blue-600/20 flex items-center space-x-1'>
          <div className='bg-blue-500 w-2 h-2 rounded-full'></div>
          <p className='text-xs text-blue-600'>{invoice.status}</p>
        </div>
      </div>
      <div className='w-1/4'>
        <p className='uppercase text-sm text-heading'>Issued on</p>
        <p className='font-semibold text-sm text-heading'>
          {formatDate(invoice.issueDate)}
        </p>
      </div>
      <div className='w-1/4'>
        <p className='text-sm text-heading'>
          {invoice.customer.properties?.[0]?.address || 'No Address'}
        </p>
      </div>
      <div className='w-1/4 flex justify-end'>
        <p className='font-bold text-sm text-heading'>
          {formatCurrency(invoice.total)}
        </p>
      </div>
    </div>
  );
};

export default CustomerDetailsInvoiceItem;
