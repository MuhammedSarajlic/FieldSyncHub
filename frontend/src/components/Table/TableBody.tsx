import { TCustomer } from '../../types/Customer';
import TableBodyItem from './TableBodyItem';

interface ITableBody {
  data: TCustomer[];
}

const TableBody = ({ data }: ITableBody) => {
  return (
    <div>
      {data.map((item) => (
        <TableBodyItem key={item.customerId} item={item} />
      ))}
    </div>
  );
};

export default TableBody;
