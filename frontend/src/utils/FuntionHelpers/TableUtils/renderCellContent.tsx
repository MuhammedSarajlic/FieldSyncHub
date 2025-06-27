import { FileText } from 'lucide-react';
import { formatDate } from '../formatDate';
import { DateTime } from 'luxon';
import { TTableColumn } from '../../../types/Table';
import { getJobPriority } from '../JobUtils/getJobPriority';

export const renderCellContent = <T extends Record<string, any>>(
  item: T,
  column: TTableColumn,
  rowIndex: number
) => {
  let value: any = null;

  if (typeof (column as any).accessor === 'function') {
    value = (column as any).accessor(item);
  } else if ((column as any).accessor) {
    const accessorKey = (column as any).accessor;
    if (
      typeof accessorKey === 'string' ||
      typeof accessorKey === 'number' ||
      typeof accessorKey === 'symbol'
    ) {
      value = (item as any)[accessorKey];
    } else {
      console.warn(
        `Unexpected accessor type for column '${column.header}':`,
        accessorKey
      );
      value = null;
    }
  }

  if ('render' in column && typeof column.render === 'function') {
    return column.render(value, item, rowIndex);
  }
  let statusConfig;
  let label;
  let localDate;
  let priorityColor;
  switch (column.type) {
    case 'text':
      return (
        <div
          className={`text-sm text-heading ${column.bold && 'font-semibold'}`}
        >
          {value ? value : '-'}
        </div>
      );

    case 'currency':
      return (
        <div
          className={`text-sm font-medium text-heading ${
            column.bold && 'font-semibold'
          }`}
        >
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

    case 'priority':
      priorityColor = column.priorityConfig?.(value) ?? getJobPriority(value);

      label =
        typeof value === 'number' && column.enumMap
          ? column.enumMap[value]
          : value;

      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColor}`}
        >
          <span className={`capitalize`}>{label}</span>
        </span>
      );

    case 'image':
      return (
        <div className='flex items-center'>
          <img
            className={`rounded-full ${column.imageSize ?? 'h-8 w-8'}`}
            src={value ?? '/default-avatar.png'}
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
            className={`rounded-full ${column.imageSize ?? 'h-8 w-8'} mr-3`}
            src={item[column.imageAccessor] ?? '/default-avatar.png'}
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
      label =
        typeof value === 'number' && column.enumMap
          ? column.enumMap[value]
          : value;

      return (
        <span
          className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
            column.badgeColor?.(value) ?? 'bg-gray-100 text-sm'
          }`}
        >
          {label}
        </span>
      );

    case 'custom':
      return column.component ? column.component(value, item, rowIndex) : value;

    default:
      return <div className='text-sm text-gray-900'>{value}</div>;
  }
};
