import { Package, Tag, Wrench } from 'lucide-react';
import { TTableColumns } from '../../types/Table';
import { TServiceItem } from '../../types/ServiceItem';
import { ServiceItemType } from '../Enumeration/ServiceItem/ServiceItem';

export const pricebookColumns: TTableColumns = [
  {
    header: 'Image',
    accessor: 'imageUrl',
    type: 'custom',
    cellClassName: 'w-20',
    render: (value: string | undefined, item: TServiceItem) => {
      const imageDisplaySize = 'h-12 w-12';

      return (
        <div className='flex items-center'>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className={`${imageDisplaySize} mr-3 rounded-md object-cover`}
            />
          ) : (
            <div
              className={`${imageDisplaySize} mr-3 rounded-md bg-gray-200 flex items-center justify-center`}
            >
              {item.type === ServiceItemType.Service ? (
                <Wrench size={20} className='text-gray-500' />
              ) : (
                <Package size={24} className='text-gray-500' />
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    header: 'Name',
    accessor: 'name',
    type: 'text',
    bold: true,
  },
  {
    header: 'Description',
    accessor: 'description',
    type: 'text',
  },
  {
    header: 'Type',
    accessor: 'type',
    type: 'badge',
    enumMap: ServiceItemType,
    badgeColor: (value: ServiceItemType) => {
      return value === ServiceItemType.Service
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800';
    },
  },
  {
    header: 'Category',
    accessor: 'category',
    type: 'badge',
    badgeColor: () => 'bg-indigo-100 text-indigo-800',
  },
  {
    header: 'SKU',
    accessor: 'sku',
    type: 'custom',
    render: (value: string | null | undefined) => {
      if (!value) {
        return <div className='text-sm text-gray-500'>-</div>;
      }
      return (
        <div className='flex items-center text-sm text-heading font-medium'>
          <Tag size={14} className='mr-1.5 text-gray-500' />
          {value}
        </div>
      );
    },
  },
  {
    header: 'Price',
    accessor: 'unitPrice',
    type: 'currency',
    bold: true,
    align: 'right',
  },
];
