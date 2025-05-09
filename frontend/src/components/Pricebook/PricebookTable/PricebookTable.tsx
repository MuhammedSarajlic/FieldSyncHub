import { TServiceItem } from '../../../types/ServiceItem';
import PricebookPagination from './PricebookPagination';
import PricebookTableBody from './PricebookTableBody';
import PricebookTableHeader from './PricebookTableHeader';

interface IPricebookTable {
  items: TServiceItem[];
}

const PricebookTable = ({ items }: IPricebookTable) => {
  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <PricebookTableHeader />
          <PricebookTableBody items={items} />
        </table>
      </div>
      <PricebookPagination items={items} />
    </div>
  );
};

export default PricebookTable;
