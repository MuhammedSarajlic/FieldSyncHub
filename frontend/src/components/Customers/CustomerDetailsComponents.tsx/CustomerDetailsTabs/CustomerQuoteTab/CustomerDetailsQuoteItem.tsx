import { TQuote } from '../../../../../types/Quote';
import { formatCurrency } from '../../../../../utils/FuntionHelpers/formatCurrency';
import { formatDate } from '../../../../../utils/FuntionHelpers/formatDate';

interface ICustomerDetailsQuoteItem {
  quote: TQuote;
}

const CustomerDetailsQuoteItem = ({ quote }: ICustomerDetailsQuoteItem) => {
  return (
    <div className='px-4 py-2 flex items-start justify-between w-full border-t-[1px] border-border-primary cursor-pointer hover:bg-[#FAFAFA]'>
      <div className='w-1/4 flex flex-col items-start space-y-1'>
        <p className='font-semibold text-heading'>{quote.quoteNumber}</p>
        <div className='px-2 py-1 rounded-full bg-blue-600/20 flex items-center space-x-1'>
          <div className='bg-blue-500 w-2 h-2 rounded-full'></div>
          <p className='text-xs text-blue-600'>{quote.status}</p>
        </div>
      </div>
      <div className='w-1/4'>
        <p className='uppercase text-sm text-heading'>Created on</p>
        <p className='font-semibold text-sm text-heading'>
          {formatDate(quote.createdAt)}
        </p>
      </div>
      <div className='w-1/4'>
        <p className='text-sm text-heading'>
          {quote.customer.properties?.[0]?.address ?? 'No Property'}
        </p>
      </div>
      <div className='w-1/4 flex justify-end'>
        <p className='font-bold text-sm text-heading'>
          {formatCurrency(quote.total)}
        </p>
      </div>
    </div>
  );
};

export default CustomerDetailsQuoteItem;
