import { ReactNode } from 'react';
import { TTableColumns } from '../../../types/Table';
import { renderCellContent } from '../../../utils/FuntionHelpers/TableUtils/renderCellContent';

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
