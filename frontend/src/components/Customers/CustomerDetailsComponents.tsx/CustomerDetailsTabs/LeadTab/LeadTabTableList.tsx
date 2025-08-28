import { TCustomerTab } from '../../../../../types/Customer';
import { TLead } from '../../../../../types/Lead';
import TabTableLoader from '../../../../CustomElements/Loaders/TabTableLoader';
import EmptyTabTable from '../EmptyTabTable';
import LeadTabItem from './LeadTabItem';

interface ILeadTabTableList {
  leads: TLead[];
  tab: TCustomerTab;
}

const LeadTabTableList = ({ leads, tab }: ILeadTabTableList) => {
  if (tab.loading) return <TabTableLoader label={tab.label} />;
  return (
    <div className='w-full'>
      {leads.length > 0 ? (
        leads.map((lead) => <LeadTabItem key={lead.id} lead={lead} />)
      ) : (
        <EmptyTabTable tab={tab} onButtonClick={() => {}} />
      )}
    </div>
  );
};

export default LeadTabTableList;
