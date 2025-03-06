import icons from '../../../../../constants/icons';
import EmptyTabTable from '../EmptyTabTable';
import CustomerDetailsInvoiceItem from './CustomerDetailsInvoiceItem';

const CustomerInvoices = () => {
  const invoices = [
    {
      jobId: 'J-1234',
      schedule: 20,
      property: 'Hamida 25, Zenica 72000, Federacija Bosne i Hercegovine',
      total: 120.0,
    },
  ];
  return (
    <div className='w-full'>
      {invoices.length > 0 ? (
        invoices.map((job) => <CustomerDetailsInvoiceItem key={job.jobId} />)
      ) : (
        <EmptyTabTable
          name='invoices'
          btnName='invoice'
          icon={icons.invoiceIcon}
        />
      )}
    </div>
  );
};

export default CustomerInvoices;
