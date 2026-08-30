import { usePagination } from '../../hooks/usePagination';
import TableHeader from './TableComponents/TableHeader';
import TableBody from './TableComponents/TableBody';
import TablePagination from './TableComponents/TablePagination';
import { useLocation, useNavigate } from 'react-router';
import TableEmptyState from './TableComponents/TableEmptyState';
import { TTableColumns, TPaginationData } from '../../types/Table';
import { ReactNode, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

interface ITable<T> {
  data: T[];
  columns: TTableColumns;
  paginationData: TPaginationData;
  loading?: boolean;
  emptyState?: ReactNode;
  bulkActions?: (selectedItems: T[]) => ReactNode;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  paginationData,
  loading = false,
  emptyState,
  bulkActions,
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedItems = useMemo(() => data.filter((item) => selectedIds.includes(String(item.id))), [data, selectedIds]);
  const toggleSelection = (id: string) => setSelectedIds((previous) => previous.includes(id) ? previous.filter((itemId) => itemId !== id) : [...previous, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === data.length ? [] : data.map((item) => String(item.id)));
  const exportSelected = () => {
    const rows = selectedItems.map((item) => JSON.stringify(item)).join('\n');
    const blob = new Blob([rows], { type: 'application/x-ndjson' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fieldsynchub-selection.ndjson';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const entity = location.pathname.includes('jobs') ? 'job' : location.pathname.includes('quotes') ? 'quote' : location.pathname.includes('invoices') ? 'invoice' : location.pathname.includes('customers') ? 'customer' : 'item';
  const defaultEmptyState = <TableEmptyState title={`No ${entity}s yet`} description={`Create your first ${entity} to start tracking work in this workspace.`} variant='create' createButtonText={`Create ${entity}`} onCreateClick={() => navigate(`${location.pathname}?create=true`)} />;

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      {selectedIds.length > 0 && <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-surface-subtle px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-800'><span className='font-medium text-gray-800 dark:text-gray-100'>{selectedIds.length} selected</span><div className='flex items-center gap-2'>{bulkActions?.(selectedItems)}<button type='button' onClick={exportSelected} className='inline-flex items-center gap-1 rounded px-2 py-1.5 text-text-primary hover:bg-white dark:hover:bg-gray-700'><Download className='h-4 w-4' /> Export</button><button type='button' onClick={() => setSelectedIds([])} className='rounded p-1.5 hover:bg-white dark:hover:bg-gray-700' aria-label='Clear selection'><X className='h-4 w-4' /></button></div></div>}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <TableHeader columns={columns} isAllSelected={data.length > 0 && selectedIds.length === data.length} onToggleAll={toggleAll} />
          <TableBody<T>
            data={data}
            columns={columns}
            onRowClick={handleRowClick}
            emptyState={emptyState ?? defaultEmptyState}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
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
