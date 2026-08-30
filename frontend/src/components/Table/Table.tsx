import { usePagination } from '../../hooks/usePagination';
import TableHeader from './TableComponents/TableHeader';
import TableBody from './TableComponents/TableBody';
import TablePagination from './TableComponents/TablePagination';
import { useLocation, useNavigate } from 'react-router';
import TableEmptyState from './TableComponents/TableEmptyState';
import { TTableColumns, TPaginationData } from '../../types/Table';
import { ReactNode } from 'react';

interface ITable<T> {
  data: T[];
  columns: TTableColumns;
  paginationData: TPaginationData;
  loading?: boolean;
  emptyState?: ReactNode;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  paginationData,
  loading = false,
  emptyState,
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
  const entity = location.pathname.includes('jobs') ? 'job' : location.pathname.includes('quotes') ? 'quote' : location.pathname.includes('invoices') ? 'invoice' : location.pathname.includes('customers') ? 'customer' : 'item';
  const defaultEmptyState = <TableEmptyState title={`No ${entity}s yet`} description={`Create your first ${entity} to start tracking work in this workspace.`} variant='create' createButtonText={`Create ${entity}`} onCreateClick={() => navigate(`${location.pathname}?create=true`)} />;

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <TableHeader columns={columns} />
          <TableBody<T>
            data={data}
            columns={columns}
            onRowClick={handleRowClick}
            emptyState={emptyState ?? defaultEmptyState}
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
