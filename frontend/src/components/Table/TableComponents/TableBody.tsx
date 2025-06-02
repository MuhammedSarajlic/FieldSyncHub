import { ReactNode } from 'react';
import { TTableColumns } from '../../../types/Table';
import { FileText } from 'lucide-react';
import { formatDate } from '../../../utils/FuntionHelpers/formatDate';
import { DateTime } from 'luxon';

interface ITableBody<T = any> {
  data: T[];
  columns: TTableColumns;
  onRowClick: (item: T) => void;
  emptyState: ReactNode;
  loading: boolean;
}

const TableBody = <T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyState,
  loading = false,
}: ITableBody<T>) => {
  const renderCellContent = (item: T, column: any, rowIndex: number) => {
    const value =
      typeof column.accessor === 'function'
        ? column.accessor(item)
        : column.accessor
        ? item[column.accessor]
        : null;

    if (column.render) {
      return column.render(value, item, rowIndex);
    }
    let statusConfig;
    let label;
    let localDate;
    switch (column.type) {
      case 'text':
        return (
          <div
            className={`text-sm text-heading ${column.bold && 'font-semibold'}`}
          >
            {value}
          </div>
        );

      case 'currency':
        return (
          <div className='text-sm font-medium text-heading'>
            $
            {typeof value === 'number'
              ? value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0.00'}
          </div>
        );

      case 'date':
        localDate = DateTime.fromISO(value, { zone: 'utc' }).toLocal();
        console.log(localDate);

        return (
          <div className='text-sm text-heading'>
            {localDate ? formatDate(localDate) : '-'}
          </div>
        );

      case 'status':
        statusConfig = column.statusConfig?.(value) ?? {
          color: 'bg-gray-100 text-gray-800',
          icon: <FileText className='w-4 h-4 mr-1.5' />,
        };

        label =
          statusConfig.label ??
          (typeof value === 'number' && column.enumMap
            ? column.enumMap[value]
            : value);

        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
          >
            {statusConfig.icon}
            <span className={`capitalize`}>{label}</span>
          </span>
        );

      case 'image':
        return (
          <div className='flex items-center'>
            <img
              className={`rounded-full ${column.imageSize || 'h-8 w-8'}`}
              src={value || '/default-avatar.png'}
              alt=''
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          </div>
        );

      case 'user':
        return (
          <div className='flex items-center'>
            <img
              className={`rounded-full ${column.imageSize || 'h-8 w-8'} mr-3`}
              src={item[column.imageAccessor] || '/default-avatar.png'}
              alt=''
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
            <div className='flex flex-col'>
              <div className='text-sm font-medium text-gray-900'>{value}</div>
              {column.subtitle && (
                <div className='text-xs text-gray-500'>
                  {item[column.subtitle]}
                </div>
              )}
            </div>
          </div>
        );

      case 'badge':
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              column.badgeColor?.(value) || 'bg-gray-100 text-gray-800'
            }`}
          >
            {value}
          </span>
        );

      case 'custom':
        return column.component
          ? column.component(value, item, rowIndex)
          : value;

      default:
        return <div className='text-sm text-gray-900'>{value}</div>;
    }
  };

  if (loading) {
    return (
      <tbody className='bg-white divide-y divide-gray-200'>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index} className='animate-pulse'>
            {columns.map((_, colIndex) => (
              <td key={colIndex} className='px-6 py-4 whitespace-nowrap'>
                <div className='h-4 bg-gray-200 rounded'></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody className='bg-white'>
        <tr>
          <td colSpan={columns.length} className='px-6 py-12 text-center'>
            {emptyState}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className='bg-white divide-y divide-gray-200'>
      {data.map((item, rowIndex) => (
        <tr
          key={item.id ?? rowIndex}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
          className={`hover:bg-gray-50 cursor-pointer h-[70px] group `}
        >
          {columns.map((column, colIndex) => (
            <td
              key={colIndex}
              className={`px-6 py-4 whitespace-nowrap ${
                column.align === 'right'
                  ? 'text-right'
                  : column.align === 'center'
                  ? 'text-center'
                  : 'text-left'
              } ${column.cellClassName ?? ''}`}
            >
              {renderCellContent(item, column, rowIndex)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
