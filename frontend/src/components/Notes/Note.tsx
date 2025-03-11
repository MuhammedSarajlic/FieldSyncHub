import icons from '../../constants/icons';

const Note = () => {
  return (
    <div className='p-4 bg-white border-[1px] border-border-primary rounded-lg space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className='bg-primary rounded-full w-8 h-8'></div>
          <div>
            <p className='text-sm font-semibold text-heading'>
              Muhammed Sarajlic
            </p>
            <p className='text-xs text-primary'>
              Created: Feb 28, 2025 11:48PM
            </p>
          </div>
        </div>
        <div>
          <img src={icons.pinIcon} alt='pin' className='w-5 h-5' />
        </div>
      </div>
      <div className='py-1'>
        <p className='text-primary text-sm'>
          Ovo je neki note za ovog klijenta kojeg smo dodali kao lead. Ovo je
          klijent za kojeg radimo trenutno
        </p>
      </div>
      {/* <div className='flex items-center space-x-3'>
        <div className='bg-gray-200 p-2 rounded-md'>
          <span className='text-gray-700'>PDF</span>
        </div>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>neki_file.pdf</p>
          <div className='text-xs text-gray-500'>
            <span>120KB</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Note;
