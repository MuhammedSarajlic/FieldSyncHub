import icons from '../../constants/AssetsConstants/icons';

const ActivityItem = () => {
  return (
    <div className='p-4 flex items-start space-x-5 border-b-[1px] border-[#ced4da] cursor-pointer hover:bg-[#f1f1f1]'>
      <div>
        <img src={icons.hammerIcons} alt='hammer' className='w-6 h-6' />
      </div>
      <div className='text-sm space-y-2'>
        <p className='text-[#032b3a] font-semibold'>
          Ide Gas converted a request into a job
        </p>
        <div className='text-[#032b3a] space-y-0.5'>
          <p>Job #3 - ovo za ovaj quote</p>
          <p>INAT Digital</p>
        </div>
        <p className='text-xs text-[#adb5bd]'>2 hours ago</p>
      </div>
    </div>
  );
};

export default ActivityItem;
