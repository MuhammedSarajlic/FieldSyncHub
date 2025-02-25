const TableBodyItem = () => {
  return (
    <div className='px-4 py-2.5 flex items-center border-t-[1px] border-border-primary cursor-pointer hover:bg-[#FAFAFA]'>
      <div className='flex items-center justify-center pr-4'>
        <input type='checkbox' className='w-4 h-4 cursor-pointer rounded-xl' />
      </div>
      <div className='w-1/4 text-sm text-heading'>Muhammed Sarajlic</div>
      <div className='w-1/4 text-sm text-heading'>
        Hamida 25, Zenica, Bosnia and Herzegovina 72000
      </div>
      <div className='w-1/4 text-sm text-heading'>Value</div>
      <div className='w-1/4 text-sm text-heading'>Value</div>
    </div>
  );
};

export default TableBodyItem;
