import { TCustomer } from '../../types/Customer';
import CustomerTableBodyItem from './CustomerTableBodyItem';

interface ICustomerTableBody {
  data: TCustomer[];
}

const CustomerTableBody = ({ data }: ICustomerTableBody) => {
  return (
    <div>
      {data.map((item) => (
        <CustomerTableBodyItem key={item.customerId} item={item} />
      ))}
    </div>
  );
};

export default CustomerTableBody;
