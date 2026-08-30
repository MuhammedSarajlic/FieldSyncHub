import { ReactNode } from 'react';
import { TTableColumns } from '../../../types/Table';
import { renderCellContent } from '../../../utils/FuntionHelpers/TableUtils/renderCellContent';

interface ITableBody<T = any> {
  data: T[];
  columns: TTableColumns;
  onRowClick: (item: T) => void;
  emptyState: ReactNode;
  loading: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
}

const TableBody = <T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyState,
  loading = false,
  selectedIds = [],
  onToggleSelection,
}: ITableBody<T>) => {
  if (loading) {
    return (
      <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800'>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index} className='animate-pulse'>
            {columns.map((_, colIndex) => (
              <td key={colIndex} className='px-6 py-4 whitespace-nowrap'>
                <div className='h-4 bg-gray-200 rounded dark:bg-gray-700'></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody className='bg-white dark:bg-gray-900'>
        <tr>
          <td colSpan={columns.length + 1} className='px-6 py-12 text-center'>
            {emptyState}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800'>
      {data.map((item, rowIndex) => (
        <tr
          key={item.id ?? rowIndex}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
          tabIndex={0}
          role='link'
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && onRowClick) {
              event.preventDefault();
              onRowClick(item);
            }
          }}
          className='h-[70px] cursor-pointer group hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bg-primary dark:hover:bg-gray-800 dark:focus:bg-gray-800'
        >
          <td className='px-4 py-4' onClick={(event) => event.stopPropagation()}><input type='checkbox' checked={selectedIds.includes(String(item.id))} onChange={() => onToggleSelection?.(String(item.id))} aria-label='Select row' className='h-4 w-4 accent-bg-primary' /></td>
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
