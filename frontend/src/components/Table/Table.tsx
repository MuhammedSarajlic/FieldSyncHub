import TableBody from './TableBody';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';

const Table = () => {
  return (
    <>
      <div className='mb-5 w-full border-[1px] border-border-primary rounded-lg overflow-hidden'>
        <TableHeader />
        <TableBody />
      </div>
      <TablePagination />
    </>
  );
};

export default Table;
