import { TTableColumns } from '../../../types/Table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router';

interface ITableHeader {
  columns: TTableColumns;
  customStyle?: string;
  isAllSelected?: boolean;
  onToggleAll?: () => void;
}

const TableHeader = ({ columns, customStyle, isAllSelected, onToggleAll }: ITableHeader) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy');
  const sort = searchParams.get('sort');

  const toggleSort = (sortKey?: string) => {
    if (!sortKey) return;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      const direction = sortBy === sortKey && sort === 'asc' ? 'desc' : 'asc';
      next.set('sortBy', sortKey);
      next.set('sort', direction);
      next.delete('page');
      return next;
    });
  };

  return (
    <thead className={`bg-gray-50 ${customStyle}`}>
      <tr>
        <th className='w-12 px-4 py-3'><input type='checkbox' checked={isAllSelected} onChange={onToggleAll} aria-label='Select all rows' className='h-4 w-4 accent-bg-primary' /></th>
        {columns.map((column, index) => (
          <th
            key={index}
            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.align === 'right'
                ? 'text-right'
                : column.align === 'center'
                ? 'text-center'
                : 'text-left'
            } ${column.customColumnStyle || ''}`}
            style={{ width: column.width }}
          >
            {typeof column === 'string' ? column : column.sortKey ? (
              <button type='button' onClick={() => toggleSort(column.sortKey)} className='inline-flex items-center gap-1 rounded text-inherit hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-bg-primary'>
                {column.header}
                {sortBy === column.sortKey ? sort === 'desc' ? <ArrowDown className='h-3.5 w-3.5' /> : <ArrowUp className='h-3.5 w-3.5' /> : <ChevronsUpDown className='h-3.5 w-3.5 text-gray-400' />}
              </button>
            ) : column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
