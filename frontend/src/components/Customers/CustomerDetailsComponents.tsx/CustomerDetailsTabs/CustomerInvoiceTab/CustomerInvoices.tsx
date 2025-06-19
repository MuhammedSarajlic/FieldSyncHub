import { TCustomerTab } from '../../../../../types/Customer';
import { TInvoice } from '../../../../../types/Invoice';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsInvoiceItem from './CustomerDetailsInvoiceItem';

interface ICustomerInvoices {
  invoices: TInvoice[];
  tab: TCustomerTab;
}

const CustomerInvoices = ({ invoices, tab }: ICustomerInvoices) => {
  return (
    <div className='w-full'>
      {invoices.length > 0 ? (
        invoices.map((invoice) => (
          <CustomerDetailsInvoiceItem
            key={invoice.invoiceId}
            invoice={invoice}
          />
        ))
      ) : (
        <EmptyTabTable tab={tab} onButtonClick={() => {}} />
      )}
    </div>
  );
};

export default CustomerInvoices;
