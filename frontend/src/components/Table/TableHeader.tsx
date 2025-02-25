const TableHeader = () => {
  return (
    <div className='px-4 py-2 flex items-center bg-[#F9FBFC]'>
      <div className='flex items-center justify-center pr-4'>
        <input type='checkbox' className='w-4 h-4 cursor-pointer rounded-xl' />
      </div>
      <div className='w-1/4 text-sm text-heading'>Name</div>
      <div className='w-1/4 text-sm text-heading'>Address</div>
      <div className='w-1/4 text-sm text-heading'>Column 3</div>
      <div className='w-1/4 text-sm text-heading'>Column 4</div>
    </div>
  );
};

export default TableHeader;
