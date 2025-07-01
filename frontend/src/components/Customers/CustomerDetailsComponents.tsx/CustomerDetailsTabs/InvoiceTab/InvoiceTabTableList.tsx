import { useNavigate } from 'react-router';
import { TCustomerTab } from '../../../../../types/Customer';
import { TInvoice } from '../../../../../types/Invoice';
import TabTableLoader from '../../../../CustomElements/Loaders/TabTableLoader';
import EmptyTabTable from '../EmptyTabTable';
import InvoiceTabItem from './InvoiceTabItem';

interface ICustomerInvoices {
  invoices: TInvoice[];
  tab: TCustomerTab;
}

const InvoiceTabTableList = ({ invoices, tab }: ICustomerInvoices) => {
  const navigate = useNavigate();
  if (tab.loading) return <TabTableLoader label={tab.label} />;

  return (
    <div className='w-full'>
      {invoices.length > 0 ? (
        invoices.map((invoice) => (
          <InvoiceTabItem key={invoice.id} invoice={invoice} />
        ))
      ) : (
        <EmptyTabTable
          tab={tab}
          onButtonClick={() => navigate('/invoices?create=true')}
        />
      )}
    </div>
  );
};

export default InvoiceTabTableList;
