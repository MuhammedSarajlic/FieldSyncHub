import { QuoteStatus } from '../../../../../constants/Enumeration/QuoteEnum/QuoteEnum';
import { TQuote } from '../../../../../types/Quote';
import { formatCurrency } from '../../../../../utils/FuntionHelpers/formatCurrency';
import { formatDate } from '../../../../../utils/FuntionHelpers/formatDate';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getQuoteStatus } from '../../../../../utils/FuntionHelpers/getQuoteStatus';

interface ICustomerDetailsQuoteItem {
  quote: TQuote;
}

const QuoteTabItem = ({ quote }: ICustomerDetailsQuoteItem) => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const expireDate = new Date(quote.expiresAt as string);
  return (
    <div
      onClick={() => navigate(`/quotes/${quote.id}`)}
      className='group flex flex-col sm:flex-row items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      {/* Left Section: Quote Number and Status */}
      <div className='flex-1 min-w-0 space-y-2'>
        <div className='flex items-center gap-3'>
          <h3 className='text-base font-semibold text-gray-900 truncate'>
            Quote #{quote.quoteNumber ?? 'N/A'}
          </h3>
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              getQuoteStatus(quote.status).color
            }`}
          >
            {QuoteStatus[quote.status]}
          </div>
        </div>

        {/* Display single most relevant date */}
        <div className='flex items-center gap-1.5 text-gray-600 text-sm'>
          <Calendar className='h-4 w-4 flex-shrink-0 text-gray-400' />
          <span>Created: {formatDate(quote.createdAt)}</span>
        </div>
      </div>

      {/* Right Section: Total Amount */}
      <div className='flex-shrink-0 text-right space-y-1'>
        <div className='font-semibold text-lg text-gray-900'>
          {formatCurrency(quote.total)}
        </div>
        {quote.expiresAt && expireDate < currentDate && quote.status == 6 && (
          <div className='flex items-center gap-1.5 text-red-600 text-sm'>
            <span>Expired at: {formatDate(quote.expiresAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteTabItem;
