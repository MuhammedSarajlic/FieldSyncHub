import icons from '../../../../../constants/icons';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsQuoteItem from './CustomerDetailsQuoteItem';

const CustomerQuotes = () => {
  const quotes = [
    {
      jobId: 'J-1234',
      schedule: 20,
      property: 'Hamida 25, Zenica 72000, Federacija Bosne i Hercegovine',
      total: 120.0,
    },
  ];
  return (
    <div className='w-full'>
      {quotes.length > 0 ? (
        quotes.map((job) => <CustomerDetailsQuoteItem key={job.jobId} />)
      ) : (
        <EmptyTabTable name='quotes' btnName='quote' icon={icons.hammerIcons} />
      )}
    </div>
  );
};

export default CustomerQuotes;
