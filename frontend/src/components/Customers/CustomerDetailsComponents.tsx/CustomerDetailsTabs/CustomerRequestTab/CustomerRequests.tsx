import icons from '../../../../../constants/icons';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsRequestItem from './CustomerDetailsRequestItem';

const CustomerRequests = () => {
  const requests = [
    {
      requestId: 'R-1234',
      schedule: 20,
      property: 'Hamida 25, Zenica 72000, Federacija Bosne i Hercegovine',
      total: 120.0,
    },
  ];
  return (
    <div className='w-full'>
      {requests.length > 0 ? (
        requests.map((job) => (
          <CustomerDetailsRequestItem key={job.requestId} />
        ))
      ) : (
        <EmptyTabTable
          name='requests'
          btnName='request'
          icon={icons.invoiceIcon}
        />
      )}
    </div>
  );
};

export default CustomerRequests;
