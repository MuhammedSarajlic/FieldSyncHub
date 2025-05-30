const TableEmptyState = () => {
  return (
    <div className='text-center py-8'>
      <div className='text-gray-500 text-sm'>No quotes found</div>
      <div className='text-gray-400 text-xs mt-1'>
        Try adjusting your filters or create a new quote
      </div>
    </div>
  );
};

export default TableEmptyState;
