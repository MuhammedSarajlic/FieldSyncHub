import { TCustomer } from '../../types/Customer';
import CustomerTableBody from './CustomerTableBody';
import CustomerTableHeader from './CustomerTableHeader';
import CustomerTablePagination from './CustomerTablePagination';

interface ICustomerTable {
  data: TCustomer[];
}

const CustomerTable = ({ data }: ICustomerTable) => {
  return (
    <>
      <div className='mb-5 w-full border-[1px] border-border-primary rounded-lg overflow-hidden'>
        <CustomerTableHeader />
        <CustomerTableBody data={data} />
      </div>
      <CustomerTablePagination />
    </>
  );
};

export default CustomerTable;
