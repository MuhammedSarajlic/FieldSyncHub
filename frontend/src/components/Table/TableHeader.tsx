const TableHeader = () => {
  return (
    <div className='px-4 py-3 flex items-center bg-gray-100 uppercase tracking-wider font-medium'>
      <div className='flex items-center justify-center pr-4'>
        <input type='checkbox' className='w-4 h-4 cursor-pointer rounded-xl' />
      </div>
      <div className='w-1/4 text-xs text-gray-500'>Name</div>
      <div className='w-1/4 text-xs text-gray-500'>Address</div>
      <div className='w-1/4 text-xs text-gray-500'>Column 3</div>
      <div className='w-1/4 text-xs text-gray-500'>Column 4</div>
    </div>
  );
};

export default TableHeader;
