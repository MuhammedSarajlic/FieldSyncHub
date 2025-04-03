import { Link } from 'react-router';
import { TCustomer } from '../../types/Customer';

interface ITableBodyItem {
  item: TCustomer;
}

const TableBodyItem = ({ item }: ITableBodyItem) => {
  return (
    <Link
      to={`/customers/${item.customerId}`}
      className='min-h-[60px] px-4 py-2.5 flex items-center border-t-[1px] border-border-primary cursor-pointer hover:bg-[#FAFAFA]'
    >
      <div className='flex items-center justify-center pr-4'>
        <input type='checkbox' className='w-4 h-4 cursor-pointer rounded-xl' />
      </div>
      <div className='w-1/4 text-sm text-heading'>
        <p className='font-bold'>
          {item.isCompany
            ? item.companyName
            : `${item.firstName} ${item.lastName}`}
        </p>
        {item.companyName && (
          <p>
            {item.isCompany
              ? `${item.firstName} ${item.lastName}`
              : item.companyName}
          </p>
        )}
      </div>
      <div className='w-1/4 text-sm text-heading line-clamp-2'>
        {item.properties.length === 0
          ? '0 properties'
          : item.properties.length === 1
          ? `${item.properties[0].street}, ${item.properties[0].city}, ${item.properties[0].country} ${item.properties[0].postalCode}`
          : `${item.properties.length} properties`}
      </div>
      <div className='w-1/4 text-sm text-heading'>Value</div>
      <div className='w-1/4 text-sm text-heading'>Value</div>
    </Link>
  );
};

export default TableBodyItem;
