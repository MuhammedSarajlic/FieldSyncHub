import { DollarSign, Package, Tag } from 'lucide-react';
import { TServiceItem } from '../../../types/ServiceItem';

interface IPricebookTableBody {
  items: TServiceItem[];
}

const PricebookTableBody = ({ items }: IPricebookTableBody) => {
  return (
    <tbody className='divide-y divide-gray-200'>
      {items.length > 0 ? (
        items.map((item) => (
          <tr
            key={item.id}
            className='hover:bg-gray-50 cursor-pointer transition-colors duration-150'
          >
            <td className='px-4 py-3 whitespace-nowrap'>
              <div className='flex items-center'>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className='h-8 w-8 mr-3 rounded-md object-cover'
                  />
                ) : (
                  <div className='h-11 w-11 mr-3 rounded-md bg-gray-200 flex items-center justify-center'>
                    {item.type === 'service' ? (
                      <p>Tool</p>
                    ) : (
                      // <Tool size={14} className='text-gray-500' />
                      <Package size={20} className='text-gray-500' />
                    )}
                  </div>
                )}
              </div>
            </td>
            <td className='px-4 py-3'>
              <div className='font-medium text-gray-900'>{item.name}</div>
            </td>
            <td className='px-4 py-3'>
              <div className='text-sm text-gray-500 max-w-xs truncate'>
                {item.description}
              </div>
            </td>
            <td className='px-4 py-3 whitespace-nowrap'>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.type === 'service'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {item.type === 'service' ? 'Service' : 'Material'}
              </span>
            </td>
            <td className='px-4 py-3 whitespace-nowrap'>
              <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800'>
                {item.category}
              </span>
            </td>
            <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
              <div className='flex items-center'>
                <Tag size={14} className='mr-1 text-gray-400' />
                {item.sku}
              </div>
            </td>
            <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium'>
              <div className='flex items-center'>
                <DollarSign size={14} className='text-gray-500' />
                {item.unitPrice.toFixed(2)}
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={11} className='px-4 py-10 text-center text-gray-500'>
            No items found matching your filters. Try adjusting your search or
            add a new item.
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default PricebookTableBody;
