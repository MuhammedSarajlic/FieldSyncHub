import { usePagination } from '../../hooks/usePagination';
import TableHeader from './TableComponents/TableHeader';
import TableBody from './TableComponents/TableBody';
import TablePagination from './TableComponents/TablePagination';
import { useLocation, useNavigate } from 'react-router';
import TableEmptyState from './TableComponents/TableEmptyState';
import { TTableColumns, TPaginationData } from '../../types/Table';

interface ITable<T> {
  data: T[];
  columns: TTableColumns;
  paginationData: TPaginationData;
  loading?: boolean;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  paginationData,
  loading = false,
}: ITable<T>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPage, onPageChange } = usePagination(1, 'page');

  const handleRowClick = (item: T) => {
    const newPath = `${location.pathname}/${item.id}`;
    navigate(newPath);
  };

  const totalPages = Math.ceil(
    paginationData.totalCount / paginationData.pageSize
  );

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <TableHeader columns={columns} />
          <TableBody<T>
            data={data}
            columns={columns}
            onRowClick={handleRowClick}
            emptyState={<TableEmptyState />}
            loading={loading}
          />
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={paginationData.totalCount}
        onPageChange={onPageChange}
        itemsPerPage={paginationData.pageSize}
      />
    </div>
  );
};

export default Table;
