import icons from '../../constants/icons';

const CustomerTablePagination = () => {
  return (
    <div className='flex items-center justify-center'>
      {/* <div className='w-1/2'>
        <p>1-10 of 60 results</p>
      </div> */}
      <div className='flex items-center space-x-1'>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <img
            src={icons.firstPageIcon}
            alt='last page'
            className='w-4.5 h-4.5'
          />
        </div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <img
            src={icons.nextPageIcon}
            alt='next page'
            className='w-4.5 h-4.5 rotate-180'
          />
        </div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-transparent rounded-md cursor-pointer bg-[#356852]'>
          <p className='text-white text-sm font-medium'>1</p>
        </div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <p className='text-sm font-medium'>2</p>
        </div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <p className='text-sm font-medium'>3</p>
        </div>
        <div>...</div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <p className='text-sm font-medium'>8</p>
        </div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <img
            src={icons.nextPageIcon}
            alt='next page'
            className='w-4.5 h-4.5'
          />
        </div>
        <div className='flex items-center justify-center h-7.5 w-7.5 border-[1px] border-border-primary rounded-md cursor-pointer'>
          <img
            src={icons.lastPageIcon}
            alt='last page'
            className='w-4.5 h-4.5'
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerTablePagination;
