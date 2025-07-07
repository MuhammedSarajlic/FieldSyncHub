import { useNavigate } from 'react-router';
import { TCustomerTab } from '../../../../../types/Customer';
import { TQuote } from '../../../../../types/Quote';
import TabTableLoader from '../../../../CustomElements/Loaders/TabTableLoader';
import EmptyTabTable from '../EmptyTabTable';
import QuoteTabItem from './QuoteTabItem';

interface ICustomerQuotes {
  quotes: TQuote[];
  tab: TCustomerTab;
}

const QuoteTabTableList = ({ quotes, tab }: ICustomerQuotes) => {
  const navigate = useNavigate();
  if (tab.loading) return <TabTableLoader label={tab.label} />;

  return (
    <div className='divide-y divide-gray-100'>
      {quotes.length > 0 ? (
        quotes.map((quote) => <QuoteTabItem key={quote.id} quote={quote} />)
      ) : (
        <EmptyTabTable
          tab={tab}
          onButtonClick={() => navigate('/quotes?create=true')}
        />
      )}
    </div>
  );
};

export default QuoteTabTableList;
