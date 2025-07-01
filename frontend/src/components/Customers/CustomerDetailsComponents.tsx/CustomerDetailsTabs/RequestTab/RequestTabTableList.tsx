import { TCustomerTab } from '../../../../../types/Customer';
import { TRequest } from '../../../../../types/Request';
import TabTableLoader from '../../../../CustomElements/Loaders/TabTableLoader';
import EmptyTabTable from '../EmptyTabTable';
import RequestTabItem from './RequestTabItem';

interface ICustomerRequests {
  requests: TRequest[];
  tab: TCustomerTab;
}

const RequestTabTableList = ({ requests, tab }: ICustomerRequests) => {
  if (tab.loading) return <TabTableLoader label={tab.label} />;
  return (
    <div className='w-full'>
      {requests.length > 0 ? (
        requests.map((request) => (
          <RequestTabItem key={request.id} request={request} />
        ))
      ) : (
        <EmptyTabTable tab={tab} onButtonClick={() => {}} />
      )}
    </div>
  );
};

export default RequestTabTableList;
