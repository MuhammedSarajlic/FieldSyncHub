import { TCustomerTab } from '../../../../../types/Customer';
import { TRequest } from '../../../../../types/Request';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsRequestItem from './CustomerDetailsRequestItem';

interface ICustomerRequests {
  requests: TRequest[];
  tab: TCustomerTab;
}

const CustomerRequests = ({ requests, tab }: ICustomerRequests) => {
  return (
    <div className='w-full'>
      {requests.length > 0 ? (
        requests.map((request) => (
          <CustomerDetailsRequestItem key={request.id} request={request} />
        ))
      ) : (
        <EmptyTabTable tab={tab} onButtonClick={() => {}} />
      )}
    </div>
  );
};

export default CustomerRequests;
