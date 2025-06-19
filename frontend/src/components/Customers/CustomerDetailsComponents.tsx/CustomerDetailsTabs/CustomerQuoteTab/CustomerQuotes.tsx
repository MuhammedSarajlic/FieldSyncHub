import { TCustomerTab } from '../../../../../types/Customer';
import { TQuote } from '../../../../../types/Quote';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsQuoteItem from './CustomerDetailsQuoteItem';

interface ICustomerQuotes {
  quotes: TQuote[];
  tab: TCustomerTab;
}

const CustomerQuotes = ({ quotes, tab }: ICustomerQuotes) => {
  return (
    <div className='w-full'>
      {quotes.length > 0 ? (
        quotes.map((quote) => (
          <CustomerDetailsQuoteItem key={quote.id} quote={quote} />
        ))
      ) : (
        <EmptyTabTable tab={tab} onButtonClick={() => {}} />
      )}
    </div>
  );
};

export default CustomerQuotes;
